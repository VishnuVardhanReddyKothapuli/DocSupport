# DocSupport: Enterprise RAG Platform with GitLoader, LangGraph & Langfuse

A production-grade, full-stack Enterprise Retrieval-Augmented Generation (RAG) platform with multi-source document ingestion (PDF, Web, YouTube, Raw Text, and Git Repository Codebases via GitLoader), LangGraph agentic workflows, strict dual guardrails, sub-second vector search, Langfuse enterprise observability, and an Electric Indigo & Octet design system.

---

## 🚀 Key Features

1. **GitLoader Codebase Ingestion**:
   - Shallow clone (`depth=1`) of any public or token-authenticated Git repository (branch, tag, or main).
   - Multi-language filtering (`.py`, `.ts`, `.tsx`, `.js`, `.jsx`, `.md`, `.rs`, `.go`, `.java`, `.cpp`, `.sql`, `.yaml`, `.json`).
   - Architectural context header injection (`// File: path | Lines x-y | Language: z`).
   - Line numbers, commit hash, and file path citations.
   - Guaranteed cleanup of cloned directories in `finally` blocks.

2. **Multi-Source Ingestion Pipeline**:
   - **PDFs**: Extracted via PyPDF with page-level chunk mapping.
   - **Web Pages**: Clean HTML extraction via BeautifulSoup with heading preservation.
   - **YouTube & Media**: Timestamped closed-caption transcripts.
   - **Text / Markdown**: Direct raw notes and system specs.

3. **LangGraph Agent Workflow**:
   - Multi-node state machine:
     `Input Guard` ➔ `pgvector Cosine Retrieval` ➔ `Sufficiency Grade` ➔ `Groq LLM Generation` ➔ `Output Hallucination Guard`
   - Explicit abstention routing: If source evidence is missing, the model abstains (`I am unable to answer this question based on the provided document.`) rather than hallucinating.

4. **Langfuse Enterprise Observability**:
   - Top-level RAG query traces with user ID, session ID, and document metadata.
   - Detailed span logging for Input Guard, Vector Search, LLM Generation, and Output Guard.
   - Automated grounding verification scores and latency tracking.

5. **High-Performance Vector DB**:
   - PostgreSQL 16 + pgvector.
   - 768-dimensional normalized embeddings (`BAAI/bge-base-en-v1.5`).
   - HNSW index on `embedding` (`vector_cosine_ops`, `m=16`, `ef_construction=64`).

6. **Modern Design System**:
   - Inspired by Octet AI Chat Palette (`#fefefe`, `#f4eff7`, `#f3e5ec`, `#d6cdd1`, `#b2a3a4`, `#565656`).
   - Electric Indigo (`#6366F1`) & Cyber Slate (`#090D16` / `#111827`) dark mode.
   - Verbatim clickable citation drawers and dual guardrail warning banners.

---

## 🛠️ Exact Ports & Access URLs

| Service | Technology | Port | Access URL |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript + Vite + Tailwind CSS | `5173` | `http://localhost:5173` |
| **Backend API** | Python 3.11 + FastAPI + Uvicorn | `8000` | `http://localhost:8000` |
| **API Docs (Swagger)** | FastAPI OpenAPI | `8000` | `http://localhost:8000/docs` & `/doc` |
| **Vector Database** | PostgreSQL 16 + pgvector extension | `5432` | `localhost:5432` |
| **Task Queue & Cache** | Redis 7 + Celery workers | `6379` | `localhost:6379` |
| **LLM Inference** | Groq API (`llama-3.3-70b-versatile` / `llama-3.1-8b-instant`) | External | Cloud API |
| **Observability** | Langfuse Tracing & Spans | Cloud/Local | `https://cloud.langfuse.com` |
| **Authentication** | Clerk Auth (JWT verification via JWKS) | External | Frontend Modal & Backend Guard |

---

## 📂 Project Directory Structure

```text
DocSupport/
├── docker-compose.yaml
├── .env.example
├── .env
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/
│   │       └── 001_initial_schema.py
│   └── app/
│       ├── main.py                     # FastAPI app, CORS, middleware, /doc redirect
│       ├── config.py                   # Pydantic BaseSettings, env variables
│       ├── database.py                 # SQLAlchemy async engine & session
│       ├── celery_app.py               # Celery worker & Redis broker config
│       ├── auth/
│       │   ├── dependencies.py         # Clerk JWT validation & user context
│       │   └── jwks.py                 # Public key retrieval & cache
│       ├── models/
│       │   ├── document.py             # Document & Source metadata model
│       │   └── chunk.py                # Embedding chunk model with Vector(768)
│       ├── schemas/
│       │   ├── document.py             # Pydantic schemas for upload & status
│       │   ├── git_loader.py           # Git repo URL, branch, filters schema
│       │   └── query.py                # Query request, answer & citation schemas
│       ├── services/
│       │   ├── embedding.py            # 768-d vector generator (BAAI/bge-base-en-v1.5)
│       │   ├── chunking.py             # Recursive character text splitter with overlap
│       │   ├── git_loader_service.py   # LangChain GitLoader / Git repo cloner & extractor
│       │   ├── parsers.py              # LangChain PDF, Website, and Audio parsers
│       │   ├── retrieval.py            # pgvector cosine similarity search
│       │   ├── guardrails.py           # Input query guard & output hallucination guard
│       │   ├── llm.py                  # Groq API client with structured prompts
│       │   ├── observability.py        # Langfuse traces, spans, and scores
│       │   └── rag_graph.py            # LangGraph StateGraph RAG Agent Workflow
│       ├── tasks/
│       │   └── ingestion_tasks.py      # Celery asynchronous ingestion jobs
│       └── routes/
│           ├── documents.py            # CRUD operations for knowledge sources
│           ├── ingest_git.py           # Endpoint to ingest Git repositories
│           ├── query.py                # RAG query execution endpoint via LangGraph
│           └── health.py               # Health & readiness checks
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.ts                  # Port 5173 strictPort & host 0.0.0.0
    ├── tailwind.config.js              # Electric Indigo & Cyber Slate + Octet design tokens
    ├── src/
    │   ├── main.tsx                    # ClerkProvider & root mount
    │   ├── App.tsx                     # Main layout & auth routing
    │   ├── index.css                   # Global styles & font imports
    │   ├── api/
    │   │   ├── apiClient.ts            # Axios instance with Clerk auth token injection
    │   │   ├── sourceIngestion.ts      # Multi-source payload builder
    │   │   └── queryResponse.ts        # Query response parser & types
    │   ├── config/
    │   │   └── sources.ts              # PDF, WEB, YOUTUBE, TEXT, GIT source definitions
    │   └── components/
    │       ├── LandingPage.tsx         # Modern landing hero, features, and auth triggers
    │       ├── Dashboard.tsx           # Knowledge library, status badges, filters, search
    │       ├── Sidebar.tsx             # Navigation, theme toggle, and user profile
    │       ├── UploadModal.tsx         # Ingestion modal supporting GitLoader & files
    │       ├── QAWorkspace.tsx         # Chat interface, streaming, and query bar
    │       ├── ChatMessage.tsx         # Markdown bubble, citations, and abstention tags
    │       └── ThemeContext.tsx        # Light/Dark mode state management
```

---

## 🏃 Running the Platform

### Option A: Docker Compose (All Services)
```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs` & `http://localhost:8000/doc`

### Option B: Local Development
1. Start PostgreSQL (with pgvector) and Redis:
   ```bash
   docker run -d --name docsupport-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=docsupport -p 5432:5432 pgvector/pgvector:pg16
   docker run -d --name docsupport-redis -p 6379:6379 redis:7-alpine
   ```

2. Start Backend:
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

3. Start Frontend:
   ```bash
   cd frontend
   npm run dev
   ```
# DocSupport
