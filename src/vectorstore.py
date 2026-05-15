from typing import List, Any
import chromadb
import uuid
from pathlib import Path


class VectorStore:

    def __init__(
        self,
        persist_directory: str = "data/vector_store",
        collection_name: str = "policy_documents"
    ):

        self.persist_directory = persist_directory
        self.collection_name = collection_name

        Path(self.persist_directory).mkdir(
            parents=True,
            exist_ok=True
        )

        # =========================
        # Initialize ChromaDB
        # =========================

        self.client = chromadb.PersistentClient(
            path=self.persist_directory
        )

        # =========================
        # Delete old collection
        # (Only for development/testing)
        # =========================

        try:

            self.client.delete_collection(
                name=self.collection_name
            )

            print(
                f"\nOld collection deleted: {self.collection_name}"
            )

        except:

            pass

        # =========================
        # Create/Get Collection
        # =========================

        self.collection = self.client.get_or_create_collection(
            name=self.collection_name
        )

        print(
            f"\nVector Store Ready: {self.collection_name}"
        )

    # =========================
    # STORE DOCUMENTS
    # =========================

    def add_documents(
        self,
        chunks: List[Any],
        embeddings
    ):

        documents = []
        metadatas = []
        ids = []

        for i, chunk in enumerate(chunks):

            documents.append(
                chunk.page_content
            )

            metadata = dict(chunk.metadata)

            metadata["chunk_id"] = i

            metadatas.append(metadata)

            ids.append(str(uuid.uuid4()))

        self.collection.add(
            documents=documents,
            embeddings=embeddings.tolist(),
            metadatas=metadatas,
            ids=ids
        )

        print(
            f"\nStored {len(documents)} chunks in vector database"
        )

        print(
            f"Total documents in DB: {self.collection.count()}"
        )