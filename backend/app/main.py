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
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from langchain_core.embeddings import Embeddings
from langchain_core.messages import HumanMessage, AIMessage
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

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.4  # ✅ slightly higher for more natural tone
)

retriever = vector_db.as_retriever(search_kwargs={"k": 5})

# ✅ Prompt now includes chat history for memory
prompt = ChatPromptTemplate.from_messages([
    ("system", """You are Rachel, a warm and friendly customer support agent for VoltHub Kenya, \
an electronics and solar energy shop in Nairobi.

YOUR PERSONALITY:
- Talk like a helpful, knowledgeable shop assistant — not a robot
- Use natural, conversational language
- Show genuine interest in helping the customer find the right product
- Use phrases like "Great choice!", "That's a popular one!", "Let me check that for you"
- Ask follow-up questions to better understand what the customer needs
- Remember what the customer said earlier in the conversation and refer back to it

STRICT RULES:
- ONLY answer questions about VoltHub products, prices, and services
- ONLY use information from the context provided below
- If a product is NOT in the context, say "I don't see that in our current stock, but you can call us on +254 713 695 300 and we'll check for you!"
- NEVER make up prices, specifications, or product details
- If asked something off-topic, warmly redirect: "That's outside my area, but I'd love to help you find the perfect product at VoltHub!"
- Always mention prices in KSh when available
- Keep responses friendly and concise — 2 to 4 sentences max unless listing products

VoltHub Inventory Context:
{context}"""),
    MessagesPlaceholder(variable_name="history"),  # ✅ memory goes here
    ("human", "{question}"),
])

def format_docs(docs):
    if not docs:
        return "NO PRODUCTS FOUND IN INVENTORY"
    return "\n\n".join(doc.page_content for doc in docs)

# ✅ Off-topic filter
OFF_TOPIC_KEYWORDS = [
    "weather", "news", "politics", "recipe", "joke",
    "sports", "movie", "music", "history", "math",
    "geography", "capital city", "translate", "poem", "essay"
]

def is_off_topic(question: str) -> bool:
    return any(keyword in question.lower() for keyword in OFF_TOPIC_KEYWORDS)

# ✅ In-memory conversation store (per session via request_id)
conversation_store: dict[str, list] = {}

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
    session_id: str = Field(default_factory=lambda: str(uuid4()))  # ✅ track conversation

class AskResponse(BaseModel):
    answer: str
    question: str
    request_id: str
    session_id: str
    timestamp: datetime

@app.get("/health")
async def health():
    return {"status": "online", "inventory_loaded": True}

@app.post("/ask", response_model=AskResponse)
async def ask(payload: AskRequest) -> AskResponse:
    question = payload.question.strip()
    session_id = payload.session_id

    if not question:
        raise HTTPException(status_code=422, detail="Question cannot be empty.")

    if is_off_topic(question):
        return AskResponse(
            answer="That's a bit outside my area! I'm best at helping you find great products at VoltHub Kenya. What electronics or solar products can I help you with today?",
            question=question,
            request_id=str(uuid4()),
            session_id=session_id,
            timestamp=datetime.now(timezone.utc),
        )

    # ✅ Get or create conversation history for this session
    history = conversation_store.get(session_id, [])

    try:
        # Retrieve relevant docs
        docs = await asyncio.to_thread(retriever.invoke, question)
        context = format_docs(docs)

        # Build the chain input with history
        chain_input = {
            "context": context,
            "history": history,
            "question": question,
        }

        # Run the chain
        answer = await asyncio.to_thread(
            (prompt | llm | StrOutputParser()).invoke,
            chain_input
        )

        # ✅ Save this exchange to memory
        conversation_store[session_id] = history + [
            HumanMessage(content=question),
            AIMessage(content=answer),
        ]

        # ✅ Keep only last 10 exchanges to avoid token overflow
        if len(conversation_store[session_id]) > 20:
            conversation_store[session_id] = conversation_store[session_id][-20:]

    except Exception as e:
        print(f"Error during RAG: {type(e).__name__}: {e}")
        raise HTTPException(status_code=500, detail="Rachel is having trouble accessing the inventory.")

    return AskResponse(
        answer=answer,
        question=question,
        request_id=str(uuid4()),
        session_id=session_id,
        timestamp=datetime.now(timezone.utc),
    )

@app.delete("/session/{session_id}")
async def clear_session(session_id: str):
    """Clear conversation history for a session"""
    conversation_store.pop(session_id, None)
    return {"status": "cleared", "session_id": session_id}