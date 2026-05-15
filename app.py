from src.data_loader import DataLoader
from src.embedding import EmbeddingPipeline
from src.vectorstore import VectorStore
from src.retriever import RAGRetriever
from src.llm import ComplianceLLM


# =========================
# LOAD DOCUMENTS
# =========================

loader = DataLoader()

documents = loader.load_documents()


# =========================
# EMBEDDING PIPELINE
# =========================

embedding_pipeline = EmbeddingPipeline()

chunks = embedding_pipeline.chunk_documents(
    documents
)

embeddings = embedding_pipeline.embed_chunks(
    chunks
)


# =========================
# VECTOR STORE
# =========================

vectorstore = VectorStore()

vectorstore.add_documents(
    chunks,
    embeddings
)


# =========================
# RETRIEVER
# =========================

retriever = RAGRetriever(
    vectorstore,
    embedding_pipeline
)


# =========================
# LLM
# =========================

compliance_llm = ComplianceLLM()


# =========================
# QUERY
# =========================

query = """
I will send customer Aadhaar and banking information
through personal email for quick approval.
"""


# =========================
# RETRIEVE DOCUMENTS
# =========================

retrieved_docs = retriever.retrieve(
    query=query,
    top_k=3
)


# =========================
# FINAL AI RESPONSE
# =========================

response = compliance_llm.generate_response(
    query=query,
    retrieved_docs=retrieved_docs
)


print("\n" + "=" * 80)
print("FINAL AI RESPONSE:\n")
print(response)