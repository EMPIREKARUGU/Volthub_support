import json
import os
import time
from langchain_core.documents import Document
from langchain_core.embeddings import Embeddings
from langchain_chroma import Chroma
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
from dotenv import load_dotenv
from typing import List

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# ✅ Wrap chromadb's DefaultEmbeddingFunction to be LangChain-compatible
class ChromaDefaultEmbeddings(Embeddings):
    def __init__(self):
        self._ef = DefaultEmbeddingFunction()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self._ef(texts)

    def embed_query(self, text: str) -> List[float]:
        return self._ef([text])[0]

def build_vector_db(json_file):
    with open(json_file, 'r') as f:
        data = json.load(f)

    documents = []
    for item in data:
        name = item.get("Product", "Unknown")
        cat = item.get("Category", "General")
        price = item.get("Price", "TBD")
        content = f"Product: {name} | Category: {cat} | Price: {price} KSh"
        documents.append(Document(page_content=content, metadata=item))

    embeddings = ChromaDefaultEmbeddings()  # ✅ LangChain-compatible

    persist_dir = os.path.join(os.path.dirname(__file__), "..", "chroma_db")

    batch_size = 50
    print(f"🧠 Vectorizing {len(documents)} products in batches of {batch_size}...")

    vector_db = Chroma.from_documents(
        documents=documents[:batch_size],
        embedding=embeddings,
        persist_directory=persist_dir
    )

    for i in range(batch_size, len(documents), batch_size):
        batch = documents[i : i + batch_size]
        print(f"⏳ Processing batch {i//batch_size + 1}...")
        vector_db.add_documents(batch)
        time.sleep(2)

    print(f"✅ Success! All products stored at: {persist_dir}")

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(current_dir, '..', 'volt_kb.json')
    build_vector_db(json_path)