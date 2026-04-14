import os
from langchain_chroma import Chroma
from langchain_core.embeddings import Embeddings
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
from typing import List

class ChromaDefaultEmbeddings(Embeddings):
    def __init__(self):
        self._ef = DefaultEmbeddingFunction()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self._ef(texts)

    def embed_query(self, text: str) -> List[float]:
        return self._ef([text])[0]

def test_retrieval():
    persist_dir = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
    embeddings = ChromaDefaultEmbeddings()

    db = Chroma(persist_directory=persist_dir, embedding_function=embeddings)

    # Try a few realistic customer queries
    test_queries = [
        "cheap solar panel",
        "inverter under 50000",
        "battery for home",
    ]

    for query in test_queries:
        print(f"\n🔍 Query: '{query}'")
        results = db.similarity_search(query, k=3)
        for i, doc in enumerate(results):
            print(f"  {i+1}. {doc.page_content}")

if __name__ == "__main__":
    test_retrieval()