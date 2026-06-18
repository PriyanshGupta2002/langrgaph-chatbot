# Agentic RAG Platform

<p align="center">
  <img src="./docs/architecture.png" alt="Agentic RAG Platform Architecture" width="100%" />
</p>

<p align="center">
  <strong>Production-Style Agentic RAG Platform built with FastAPI, LangGraph, Celery, Redis, PostgreSQL and Next.js</strong>
</p>

<p align="center">
  AI Chat • Persistent Memory • Agentic RAG • Vector Search • Background Processing • Real-Time Streaming
</p>

---

## Overview

A production-style AI platform built from scratch to understand how modern AI systems work beyond simple LLM wrappers.

This project combines:

- Conversational AI
- Agentic Workflows
- Retrieval-Augmented Generation (RAG)
- Document Intelligence
- Background Processing
- Persistent Memory
- Real-Time Streaming

Users can upload documents, track ingestion progress in real time, and ask questions grounded in their data.

The system automatically:

1. Uploads and stores documents
2. Processes PDFs asynchronously
3. Creates embeddings
4. Stores vectors in PostgreSQL using pgvector
5. Retrieves relevant context
6. Generates grounded AI responses

---

## Tech Stack

### Backend

- FastAPI
- LangGraph
- OpenAI
- PostgreSQL
- pgvector
- SQLAlchemy
- Alembic
- Celery
- Redis
- JWT Authentication
- Server-Sent Events (SSE)

### Frontend

- Next.js 15
- React
- TypeScript
- TailwindCSS
- ShadCN UI
- React Query
- React Markdown

### AI & Retrieval

- OpenAI GPT Models
- OpenAI Embeddings
- LangGraph
- Vector Similarity Search
- Retrieval-Augmented Generation (RAG)

---

## Architecture

```text
                    ┌────────────────────┐
                    │      Next.js       │
                    │      Frontend      │
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │      FastAPI       │
                    │    API Gateway     │
                    └─────────┬──────────┘
                              │
           ┌──────────────────┼──────────────────┐
           ▼                  ▼                  ▼

    ┌────────────┐    ┌──────────────┐    ┌────────────┐
    │ LangGraph  │    │ PostgreSQL   │    │   Celery   │
    │   Memory   │    │  Chat Data   │    │  Workers   │
    └─────┬──────┘    └──────────────┘    └─────┬──────┘
          │                                     │
          ▼                                     ▼
    ┌────────────┐                       ┌────────────┐
    │Checkpoint  │                       │   Redis    │
    │ Persistence│                       │   Queue    │
    └────────────┘                       └────────────┘

                         Document Pipeline

                         PDF Upload
                              │
                              ▼
                        Load Document
                              │
                              ▼
                         Chunk Text
                              │
                              ▼
                      Create Embeddings
                              │
                              ▼
                   PostgreSQL + pgvector
                              │
                              ▼
                      Similarity Search
                              │
                              ▼
                      Context Retrieval
                              │
                              ▼
                        LLM Response
```

---

## Features

### Authentication

- User Registration
- Login
- JWT Authentication
- Protected Routes
- Current User Dependency

### AI Chat

- ChatGPT-style Conversations
- Thread Management
- Conversation Persistence
- Context-Aware Responses
- LangGraph Memory
- Streaming Responses
- Tool Calling

### Agentic RAG

- PDF Uploads
- Asynchronous Processing Pipeline
- Document Chunking
- Embedding Generation
- Vector Storage
- Semantic Search
- Context Retrieval
- Grounded Responses

### Background Processing

- Celery Workers
- Redis Queues
- Retry Mechanisms
- Progress Tracking
- Failure Recovery
- Status Monitoring

### Real-Time Streaming

- SSE Streaming
- Token-by-Token Responses
- Markdown Streaming
- Tool Execution Events
- Live Progress Updates

---

## RAG Pipeline

```text
User Uploads PDF
        │
        ▼
Load Document
        │
        ▼
Chunk Document
        │
        ▼
Generate Embeddings
        │
        ▼
Store Vectors (pgvector)
        │
        ▼
User Query
        │
        ▼
Query Embedding
        │
        ▼
Similarity Search
        │
        ▼
Retrieve Context
        │
        ▼
LLM Response
```

---

## Database Schema

```text
users
│
├── threads
│    │
│    └── messages
│
└── documents
     │
     └── document_chunks
```

### Users

```text
id
name
username
email
password
created_at
```

### Threads

```text
thread_id
title
user_id
created_at
updated_at
```

### Messages

```text
message_id
thread_id
role
content
status
created_at
updated_at
```

### Documents

```text
document_id
user_id
document_name
document_url
document_stage
document_completion_rate
created_at
updated_at
```

### Document Chunks

```text
chunk_id
document_id
content
embedding
created_at
updated_at
```

---

## Current Capabilities

✅ JWT Authentication

✅ Thread Management

✅ Message Persistence

✅ LangGraph Integration

✅ Checkpoint Memory

✅ SSE Streaming

✅ Markdown Rendering

✅ Tool Calling

✅ PDF Uploads

✅ Celery Workers

✅ Redis Queue

✅ Document Chunking

✅ OpenAI Embeddings

✅ pgvector Integration

✅ Similarity Search

✅ Agentic RAG Pipeline

✅ Real-Time Processing Status

✅ Document Preview

---

## Engineering Challenges Solved

### SSE Markdown Corruption

While implementing streaming markdown responses, markdown tables appeared broken even though the model output was correct.

The issue:

```python
yield f"data: {token}\n\n"
```

Newline characters inside tokens were interpreted by SSE as message boundaries.

The solution:

```python
yield f"data: {json.dumps(token)}\n\n"
```

Frontend:

```typescript
const token = JSON.parse(data);
```

This preserved:

- Tables
- Lists
- Headings
- Code Blocks
- Markdown Formatting

---

## Getting Started

### Backend

```bash
cd chatbot-backend

uv venv
source .venv/bin/activate

uv sync

alembic upgrade head

uvicorn app.main:app --reload
```

### Start Redis

```bash
docker run -d \
  --name redis \
  -p 6379:6379 \
  redis:latest
```

### Start Celery Worker

```bash
celery -A app.worker.celery_app worker --loglevel=info
```

---

### Frontend

```bash
cd chatbot-frontend

npm install

npm run dev
```

---

## Roadmap

### Completed

- JWT Authentication
- Thread Management
- Message Persistence
- LangGraph Integration
- Checkpoint Memory
- SSE Streaming
- Markdown Rendering
- Tool Events
- Document Uploads
- Celery Processing
- Redis Queues
- Agentic RAG Pipeline

### Next

- Source Citations
- Multi-Document Retrieval
- Hybrid Search (BM25 + Vector)
- Human-in-the-Loop Workflows
- SQL Agent
- Multi-Agent Systems
- Docker Deployment
- Kubernetes Support

---

## Author

**Priyansh Gupta**

Software Engineer → AI Engineer

Building AI Systems in Public

- GitHub: https://github.com/PriyanshGupta2002
- LinkedIn: https://linkedin.com/in/priyansh-gupta

---

## License

MIT