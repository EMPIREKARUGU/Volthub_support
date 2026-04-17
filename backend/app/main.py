from __future__ import annotations
import asyncio
import os
from datetime import datetime, timezone
from uuid import uuid4
from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from langchain_chroma import Chroma
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.embeddings import Embeddings
from chromadb.utils.embedding_functions import DefaultEmbeddingFunction
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

# --- EMBEDDINGS ---
class ChromaDefaultEmbeddings(Embeddings):
    def __init__(self):
        self._ef = DefaultEmbeddingFunction()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        return self._ef(texts)

    def embed_query(self, text: str) -> List[float]:
        return self._ef([text])[0]

# --- INITIALIZE RAG COMPONENTS ---
embeddings = ChromaDefaultEmbeddings()
persist_dir = os.path.join(os.path.dirname(__file__), "..", "chroma_db")

vector_db = Chroma(
    persist_directory=persist_dir,
    embedding_function=embeddings
)

# ✅ Groq instead of Gemini
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.2
)

retriever = vector_db.as_retriever(search_kwargs={"k": 3})

prompt = ChatPromptTemplate.from_template("""
You are Rachel, a friendly and helpful customer support agent for VoltHub Kenya, 
a shop that sells electronics and solar energy products.
Use the following product information to answer the customer's question naturally and helpfully.
If the product is not in the context, say so honestly but remain helpful.
Always mention prices in KSh when available.

Context: {context}

Customer Question: {question}

Rachel:""")

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# --- FASTAPI SETUP ---
app = FastAPI(
    title="VoltHub Rachel API",
    description="AI Agent for VoltHub Kenya Inventory Management.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AskRequest(BaseModel):
    question: str = Field(..., min_length=1)

class AskResponse(BaseModel):
    answer: str
    question: str
    request_id: str
    timestamp: datetime

@app.get("/health")
async def health():
    return {
        "status": "online", 
        "inventory_loaded": "true"  # Change True (boolean) to "true" (string)
    }

@app.post("/ask", response_model=AskResponse)
async def ask(payload: AskRequest) -> AskResponse:
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=422, detail="Question cannot be empty.")

    try:
        answer = await asyncio.to_thread(rag_chain.invoke, question)

    except Exception as e:
        print(f"Error during RAG: {e}")
        raise HTTPException(status_code=500, detail="Rachel is having trouble accessing the inventory.")

    return AskResponse(
        answer=answer,
        question=question,
        request_id=str(uuid4()),
        timestamp=datetime.now(timezone.utc),
    )