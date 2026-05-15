from pathlib import Path
from typing import List
from langchain_core.documents import Document
from langchain_community.document_loaders import TextLoader


class DataLoader:

    def __init__(self, data_dir: str = "data"):
        self.data_dir = Path(data_dir)

    def load_documents(self) -> List[Document]:

        documents = []

        txt_files = list(self.data_dir.rglob("*.txt"))

        print(f"\nFound {len(txt_files)} text files")

        for file_path in txt_files:

            try:
                loader = TextLoader(str(file_path), encoding="utf-8")

                docs = loader.load()

                documents.extend(docs)

                print(f"Loaded: {file_path.name}")

            except Exception as e:

                print(f"Error loading {file_path.name}: {e}")

        print(f"\nTotal Loaded Documents: {len(documents)}")

        return documents