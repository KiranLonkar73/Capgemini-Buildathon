from typing import List, Dict, Any


class RAGRetriever:

    def __init__(
        self,
        vectorstore,
        embedding_pipeline
    ):

        self.vectorstore = vectorstore
        self.embedding_pipeline = embedding_pipeline

    # =========================
    # RETRIEVE DOCUMENTS
    # =========================

    def retrieve(
        self,
        query: str,
        top_k: int = 3
    ) -> List[Dict[str, Any]]:

        print(f"\nRetrieving documents for query:\n{query}")

        # Generate query embedding
        query_embedding = self.embedding_pipeline.model.encode(
            [query]
        )[0]

        # Search Vector DB
        results = self.vectorstore.collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=top_k
        )

        retrieved_docs = []

        documents = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results["distances"][0]

        for i, (
            document,
            metadata,
            distance
        ) in enumerate(
            zip(documents, metadatas, distances)
        ):

            retrieved_docs.append(
                {
                    "rank": i + 1,
                    "content": document,
                    "metadata": metadata,
                    "similarity_score": distance
                }
            )

        print(
            f"\nRetrieved {len(retrieved_docs)} documents"
        )

        return retrieved_docs