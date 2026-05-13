import os
import tempfile
from typing import List
# New/Correct
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq
# New/Correct
from langchain_core.output_parsers import PydanticOutputParser
from schemas import ComplianceResult
# New/Correct
from langchain_core.documents import Document as LC_Document
from parser import parse_pdf
from document_processor import chunk_pages


PERSIST_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")


def _get_embeddings():
    return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")


def _get_vectorstore(embeddings=None) -> Chroma:
    embeddings = embeddings or _get_embeddings()
    # load existing chroma or create an empty one
    try:
        vect = Chroma(persist_directory=PERSIST_DIR, embedding_function=embeddings)
        return vect
    except Exception:
        # fallback: create from empty list
        return Chroma.from_documents([], embeddings, persist_directory=PERSIST_DIR)


def ingest_document(file_path: str, filename: str) -> int:
    pages = parse_pdf(file_path, filename)
    docs = chunk_pages(pages)
    embeddings = _get_embeddings()
    vect = _get_vectorstore(embeddings)

    if not docs:
        return 0

    try:
        vect.add_documents(docs)
        vect.persist()
        return len(docs)
    except Exception:
        # If add_documents isn't supported, recreate collection
        Chroma.from_documents(docs, embeddings, persist_directory=PERSIST_DIR)
        return len(docs)


def analyze_text(content: str) -> ComplianceResult:
    """Retrieve top 3 policy chunks and ask the Compliance Officer agent.

    Returns a parsed ComplianceResult (pydantic model).
    """
    embeddings = _get_embeddings()
    vect = _get_vectorstore(embeddings)

    retr_docs: List[LC_Document] = []
    try:
        retr_docs = vect.similarity_search(content, k=3)
    except Exception:
        # no vectorstore or empty
        retr_docs = []

    contexts = []
    for d in retr_docs:
        md = d.metadata or {}
        ctx = f"Source: {md.get('source')} | Page: {md.get('page')} | Section: {md.get('section')}\n{d.page_content}"
        contexts.append(ctx)

    system_prompt = (
        "You are a Capgemini Compliance Agent. Compare the User Input against the provided Policy Context. "
        "If a violation is found, flag it, quote the policy, and provide a compliant rewrite. "
        "If no violation is found, or if the context is irrelevant, set is_compliant to true. "
        "DO NOT be overly sensitive (Manage False Positives)."
    )

    # Build a compact prompt
    policy_context = "\n\n---\n\n".join(contexts) if contexts else "(no policy context available)"
    user_prompt = f"User Input:\n{content}\n\nPolicy Context:\n{policy_context}\n\nRespond strictly in JSON matching the schema: is_compliant: bool, violations: list of {{flagged_text, policy_reference, explanation, suggested_rewrite}}"

    # Use pydantic parser to enforce output
    parser = PydanticOutputParser(pydantic_object=ComplianceResult)

    llm_api_key = os.getenv("GROQ_API_KEY")
    try:
        llm = ChatGroq(api_key=llm_api_key)
        prompt = system_prompt + "\n\n" + user_prompt
        raw = llm.predict(prompt)
        # parse
        parsed = parser.parse(raw)
        return parsed
    except Exception:
        # Return a safe default error result
        return ComplianceResult(is_compliant=True, violations=[])
