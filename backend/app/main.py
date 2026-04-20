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

# ✅ temperature=0.0 for maximum factuality
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.0
)

# ✅ k=5 for more context = less hallucination
retriever = vector_db.as_retriever(search_kwargs={"k": 5})

# ✅ Strict prompt to keep Rachel on scope
prompt = ChatPromptTemplate.from_template("""
You are Rachel, a customer support agent for VoltHub Kenya, an electronics and solar energy shop.

STRICT RULES:
- ONLY answer questions about VoltHub products, prices, and services
- ONLY use information from the context provided below
- If a product is NOT in the context, say "I don't have that product in our current inventory"
- NEVER make up prices, specifications, or product details
- NEVER answer questions unrelated to VoltHub (no general knowledge, no coding help, no news)
- If asked something off-topic, say "I can only help with VoltHub Kenya product inquiries"
- Always mention prices in KSh when available
- Keep responses concise and helpful
- If context says "NO PRODUCTS FOUND IN INVENTORY", tell the customer that product is not available and suggest they call +254 713 695 300

Context (VoltHub inventory):
{context}

Customer Question: {question}

Rachel:""")

# ✅ Fallback when no docs found
def format_docs(docs):
    if not docs:
        return "NO PRODUCTS FOUND IN INVENTORY"
    return "\n\n".join(doc.page_content for doc in docs)

rag_chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | prompt
    | llm
    | StrOutputParser()
)

# ✅ Off-topic filter
OFF_TOPIC_KEYWORDS = [
    "weather", "news", "politics", "code", "programming",
    "recipe", "joke", "sports", "movie", "music", "history",
    "math", "science", "geography", "capital city", "who is",
    "what is the meaning", "translate", "poem", "essay"
]

def is_off_topic(question: str) -> bool:
    q = question.lower()
    return any(keyword in q for keyword in OFF_TOPIC_KEYWORDS)

# --- FASTAPI SETUP ---
app = FastAPI(
    title="VoltHub Rachel API",
    description="AI Agent for VoltHub Kenya Inventory Management.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
        "inventory_loaded": True
    }

@app.post("/ask", response_model=AskResponse)
async def ask(payload: AskRequest) -> AskResponse:
    question = payload.question.strip()
    if not question:
        raise HTTPException(status_code=422, detail="Question cannot be empty.")

    # ✅ Reject off-topic questions immediately
    if is_off_topic(question):
        return AskResponse(
            answer="I can only help with VoltHub Kenya product inquiries. Please ask me about our products, prices, or services. For other assistance, call us on +254 713 695 300.",
            question=question,
            request_id=str(uuid4()),
            timestamp=datetime.now(timezone.utc),
        )

    try:
        answer = await asyncio.to_thread(rag_chain.invoke, question)

    except Exception as e:
        print(f"Error during RAG: {type(e).__name__}")
        raise HTTPException(status_code=500, detail="Rachel is having trouble accessing the inventory.")

    return AskResponse(
        answer=answer,
        question=question,
        request_id=str(uuid4()),
        timestamp=datetime.now(timezone.utc),
    )