from typing import List, Any

import numpy as np

from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer


class EmbeddingPipeline:

    def __init__(
        self,
        model_name: str = "all-MiniLM-L6-v2",
        chunk_size: int = 500,
        chunk_overlap: int = 50
    ):

        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        self.model = SentenceTransformer(model_name)

        print(f"\nEmbedding model loaded: {model_name}")

    # =========================
    # CHUNK DOCUMENTS
    # =========================

    def chunk_documents(
        self,
        documents: List[Any]
    ) -> List[Any]:

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )

        chunks = splitter.split_documents(documents)

        print(f"\nCreated {len(chunks)} chunks")

        return chunks

    # =========================
    # CREATE EMBEDDINGS
    # =========================

    def embed_chunks(
        self,
        chunks: List[Any]
    ) -> np.ndarray:

        texts = [
            chunk.page_content
            for chunk in chunks
        ]

        print(f"\nGenerating embeddings for {len(texts)} chunks...")

        embeddings = self.model.encode(
            texts,
            show_progress_bar=True
        )

        print(f"\nEmbedding shape: {embeddings.shape}")

        return embeddings