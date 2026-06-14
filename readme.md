# LangGraph Chatbot

A production-style AI chat application built from scratch — ChatGPT-style thread management, real-time token streaming, and persistent conversation memory using LangGraph.

**Stack:** FastAPI · PostgreSQL · Async SQLAlchemy · Alembic · JWT Auth · LangGraph · OpenAI · SSE · Next.js · TypeScript

---

## Architecture

```
chatbot-backend/     → FastAPI + LangGraph + PostgreSQL
chatbot-frontend/    → Next.js + TypeScript + Tailwind
```

### Request flow

```
React Frontend
      ↓
POST /chat/stream
      ↓
FastAPI StreamingResponse
      ↓
LangGraph astream()
      ↓
Token streaming via SSE
      ↓
UI updates live
```

### Database schema

```
users
 └── threads (UUID-based, user-owned)
        └── messages (role + status enums, timestamp tracking)
```

### Conversation memory

```
Thread ID
     ↓
LangGraph Checkpointer
     ↓
Conversation history loaded
     ↓
Context-aware OpenAI response
```

---

## Features

- **JWT Authentication** — register, login, protected routes, current user dependency
- **Thread management** — create, list, and retrieve ChatGPT-style conversation threads
- **Message persistence** — full message history with roles (`USER`, `ASSISTANT`, `SYSTEM`, `TOOL`) and statuses (`PENDING`, `COMPLETED`, `FAILED`)
- **LangGraph integration** — StateGraph with OpenAI, HumanMessage handling, thread-aware invocation
- **Real-time streaming** — SSE via `FastAPI StreamingResponse` + `LangGraph astream()`
- **Conversation memory** — per-thread context retention via LangGraph checkpointer
- **Next.js frontend** — streaming assistant bubble, optimistic updates, thread sidebar

---

## Getting started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL

---

### Backend setup

```bash
cd chatbot-backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/chatbot
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-api-key
```

```bash
# Run migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

API will be running at `http://localhost:8000`. Docs at `http://localhost:8000/docs`.

---

### Frontend setup

```bash
cd chatbot-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
NEXT_PUBLIC_BASE_URL=http://localhost:8000
```

```bash
npm run dev
```

Frontend will be running at `http://localhost:3000`.

---

## API reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/register` | Register a new user | No |
| `POST` | `/auth/login` | Login, returns JWT | No |
| `GET` | `/auth/me` | Get current user | Yes |
| `POST` | `/threads` | Create a new thread | Yes |
| `GET` | `/threads` | List all user threads | Yes |
| `GET` | `/threads/:id` | Get thread with messages | Yes |
| `POST` | `/chat/stream` | Stream a chat response (SSE) | Yes |

---

## Project structure

```
chatbot-backend/
├── app/
│   ├── ai/
│   │   ├── graph.py          # LangGraph StateGraph definition
│   │   └── checkpointer.py   # Conversation memory setup
│   ├── api/
│   │   ├── auth.py           # Register, login, JWT endpoints
│   │   ├── threads.py        # Thread CRUD
│   │   └── chat.py           # Streaming chat endpoint
│   ├── database/
│   │   ├── models/           # SQLAlchemy models
│   │   └── enums/            # MessageRole, MessageStatus
│   ├── schema/               # Pydantic request/response schemas
│   ├── services/             # Business logic layer
│   └── main.py
├── alembic/                  # Database migrations
└── requirements.txt

chatbot-frontend/
├── src/
│   ├── app/
│   │   ├── chat/             # Chat page + thread routing
│   │   └── threads/[id]/     # Thread detail page
│   ├── components/
│   │   ├── chat-container.tsx
│   │   ├── message-box.tsx   # Markdown rendering + streaming UI
│   │   └── chat-input.tsx
│   └── services/
│       └── chat/chat.api.ts  # SSE streaming client
```

---

## What I learned building this

- Async SQLAlchemy session management and common pitfalls
- Alembic migrations with PostgreSQL enum types
- LangGraph `astream()` with `stream_mode=["messages"]`
- Checkpointer configuration for per-thread memory
- SSE event parsing (`event:` vs `data:` fields)
- JWT middleware with FastAPI dependencies
- Pydantic v2 serialization with SQLAlchemy relationships

---

## Roadmap

- [ ] RAG pipeline with vector store integration
- [ ] Tool-calling agents (web search, code execution)
- [ ] Multi-agent workflows with LangGraph
- [ ] File/image upload support
- [ ] Docker + deployment config

---

## Author

**Priyansh Gupta** — Software Engineer learning AI Engineering

[GitHub](https://github.com/PriyanshGupta2002) · [LinkedIn](https://linkedin.com/in/priyansh-gupta)

---

## License

MIT