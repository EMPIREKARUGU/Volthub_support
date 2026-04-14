# Live Conversation Hub

## Frontend

- React + TypeScript
- Vite on `http://localhost:8080`

## Backend Bridge

The FastAPI bridge lives in [backend/main.py](/Users/mac/Liwel/Final_Project/customer_support/live-conversation-hub/backend/main.py).

Install and run it with:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The frontend calls `POST /api/ask`, and Vite proxies that request to the FastAPI endpoint at `POST /ask`.

Example request:

```bash
curl -X POST http://127.0.0.1:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"question":"Where is my order?"}'
```
