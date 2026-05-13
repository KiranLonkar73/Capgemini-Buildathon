# New/Correct
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document
from typing import List, Dict


splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=60)


def chunk_pages(pages: List[Dict]) -> List[Document]:
    """Turn parsed pages into langchain Documents with metadata for RAG.

    Each chunk's metadata includes: source (filename), page, section.
    """
    docs: List[Document] = []
    for page in pages:
        text = page.get("text", "")
        if not text or not text.strip():
            continue

        chunks = splitter.split_text(text)
        for i, c in enumerate(chunks):
            meta = {
                "source": page.get("source"),
                "page": page.get("page"),
                "section": page.get("section") or f"page_{page.get('page')}",
                "chunk_index": i,
            }
            docs.append(Document(page_content=c, metadata=meta))

    return docs
