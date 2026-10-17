# DocSupport — Full-Stack RAG Knowledge Assistant

DocSupport is a full-stack, document-grounded Retrieval-Augmented Generation (RAG) platform and knowledge assistant. It allows users to upload multi-format documents, ask questions in natural language, and receive context-aware, verifiable answers backed by exact source citations.

Orchestrated with **LangGraph**, **FastAPI**, **PostgreSQL with pgvector**, and **React 19**, DocSupport enforces dual guardrails that screen prompt injections, check evidence sufficiency, and explicitly abstain when factual evidence is absent—mitigating hallucinations and ensuring accountable answers.

---

## 🚀 Key Features

1. **Multi-Source Document Ingestion**:
   - **PDFs**: Layout-aware parsing via `pypdf` with page-level chunk mapping and page citations.
   - **Web Pages & Articles**: HTML text extraction using `BeautifulSoup`, stripping scripts and boilerplate while retaining semantic hierarchy.
   - **YouTube & Media Transcripts**: Closed-caption extraction with timestamp markers `[MM:SS]` for direct timeline reference.
   - **Markdown & Raw Text**: Direct text and notes ingestion with paragraph and line tracking.

2. **LangGraph Agentic Orchestration**:
   - Multi-node state machine enforcing strict retrieval-augmented constraints:
     `Input Guard` ➔ `pgvector Cosine Retrieval` ➔ `Sufficiency Grade` ➔ `Groq LLM Generation` ➔ `Output Guard`
   - **Deterministic Abstention**: If retrieved chunks fail similarity thresholds, the system explicitly abstains (`"I am unable to answer this question based on the provided document."`) instead of speculating.

3. **Dual Guardrail Engine**:
   - **Input Safety Guard**: Regex and pattern-based screening for adversarial prompt injections, system prompt leak attempts, and jailbreaks before database query execution.
   - **Output Grounding Guard**: Inspects generated responses, verifies bracketed citation tags (e.g., `[1]`, `[2]`), and matches claims against retrieved source chunk contents.

4. **Dense Vector Retrieval with pgvector**:
   - Normalized 768-dimensional embeddings generated via `BAAI/bge-base-en-v1.5` (`SentenceTransformers`).
   - PostgreSQL 16 `pgvector` HNSW index (`vector_cosine_ops`, `m=16`, `ef_construction=64`) for sub-second cosine distance search scoped by document ID.

5. **Granular LLM Observability**:
   - Native **Langfuse v3** tracing capturing root query traces, child spans for each pipeline stage, execution latencies, token consumption, and automated binary grounding verification scores.

6. **Asynchronous Backend & Distributed Task Queue**:
   - Asynchronous FastAPI endpoints with SQLAlchemy `AsyncSession` (`asyncpg`).
   - Celery background workers backed by Redis for non-blocking document parsing and batch vector embedding generation.

7. **Modern Full-Stack Workspace**:
   - React 19, TypeScript, Vite, Tailwind CSS, Motion, and Lucide icons.
   - Interactive knowledge dashboard, status polling, split-view citation inspector drawer, and dark/light mode.

---

## 🧠 How the RAG Pipeline Works

The RAG workflow is modeled as a compiled state graph (`StateGraph`) in LangGraph:

```mermaid
flowchart TD
    A["User Query Input"] --> B["Node 1: Input Guardrail<br/>(Sanitization & Injection Screening)"]
    B -->|Safe Query| C["Node 2: pgvector Retrieval<br/>(768d Cosine Distance Search)"]
    B -->|Injection Flagged| F["Node 6: Abstain / Rejection Node<br/>(Deterministic Response)"]
    C --> D["Node 3: Evidence Sufficiency Grade<br/>(Threshold Check: score >= 0.25)"]
    D -->|Evidence Sufficient| E["Node 4: Groq LLM Generation<br/>(Strict System Prompt & Temperature 0.1)"]
    D -->|Evidence Missing| F
    E --> G["Node 5: Output Guardrail<br/>(Citation Verification & Grounding Check)"]
    G --> H["Verified Answer with Citations"]
    F --> I["Explicit Abstention Message"]
```

### Pipeline Execution Steps:
1. **Input Guard Node**: Validates length, sanitizes non-printable sequences, and screens against known adversarial injection patterns. Flagged queries immediately route to the fallback node.
2. **Retrieval Node**: Computes the 768-dimensional query vector and executes a cosine distance SQL query (`1 - (embedding <=> :query_vector)`) filtered by `document_id`.
3. **Sufficiency Grade Node**: Evaluates the retrieved candidates. If zero chunks exceed the minimum cosine similarity threshold, the workflow branches to abstention.
4. **Generation Node**: Calls the Groq API (`llama-3.3-70b-versatile`) with a grounded system prompt requiring bracketed citations matching 1-indexed context chunks.
5. **Output Guard Node**: Verifies that cited chunks exist and match source excerpts. If the model generated an unsupported or ungrounded response, it converts the output into an explicit abstention.

---

## 📄 Supported Knowledge Sources

| Source Type | Extractor / Parser | Chunking Strategy | Extracted Metadata |
| :--- | :--- | :--- | :--- |
| **PDF Documents** | `pypdf.PdfReader` | Recursive Character (900 chars, 150 overlap) | `file_name`, `page_number`, `total_pages` |
| **Web Pages** | `requests` + `BeautifulSoup` | Recursive Character with heading preservation | `url`, `page_title`, `line_start` |
| **YouTube Transcripts** | `youtube_transcript_api` | Recursive Character with timestamp alignment | `url`, `video_id`, `timestamp [MM:SS]` |
| **Markdown / Text** | Direct text parser | Recursive Character with line mapping | `title`, `line_start`, `line_end` |

> *Note: For internal and backward compatibility, the backend service also maintains an asynchronous Git repository ingestion endpoint.*

---

## 🛠️ Technology Stack & Architecture

```text
DocSupport/
├── render.yaml                 # Render Blueprint configuration
├── docker-compose.yaml         # Multi-container local orchestration
├── backend/
│   ├── Dockerfile              # Python 3.11 slim container definition
│   ├── requirements.txt        # Backend dependencies
│   ├── alembic/                # Database migrations & pgvector HNSW index
│   └── app/
│       ├── main.py             # FastAPI entry point & CORS configuration
│       ├── config.py           # Pydantic BaseSettings configuration
│       ├── database.py         # SQLAlchemy async & sync session factories
│       ├── celery_app.py       # Celery worker & Redis broker setup
│       ├── auth/               # Clerk JWT verification via JWKS
│       ├── models/             # SQLAlchemy Document & Chunk models
│       ├── schemas/            # Pydantic validation schemas
│       ├── routes/             # REST endpoints (documents, query, health)
│       ├── services/           # Parsers, embeddings, retrieval, guardrails, LLM
│       └── tasks/              # Celery background ingestion tasks
└── frontend/
    ├── Dockerfile              # Node build + Nginx alpine production image
    ├── package.json            # React 19 & Tailwind dependencies
    ├── vite.config.ts          # Vite build configuration
    └── src/
        ├── api/                # Axios API client & endpoints
        ├── components/         # Workspace, Dashboard, Citations, Landing Page
        └── config/             # Supported source definitions
```

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Motion, Lucide React
* **Backend API**: Python 3.11, FastAPI, Uvicorn, Pydantic v2
* **Agent Framework**: LangGraph, LangChain Core
* **Vector Store**: PostgreSQL 16 with `pgvector` (HNSW indexing, cosine similarity)
* **Embedding Model**: `BAAI/bge-base-en-v1.5` (768 dimensions via SentenceTransformers)
* **LLM Inference**: Groq Cloud API (`llama-3.3-70b-versatile` / `openai/gpt-oss-120b`)
* **Task Queue & Cache**: Redis 7 + Celery
* **Observability**: Langfuse v3 Tracing & Spans
* **Authentication**: Clerk Auth (JWT verification using public JWKS)

---

## ⚙️ System Requirements & Environment Variables

Create a `.env` file in the project root (see `.env.example`):

```bash
# Server Configuration
PORT=8000
ENVIRONMENT=development
DEBUG=True

# Database Configuration (PostgreSQL 16 + pgvector)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/docsupport
SYNC_DATABASE_URL=postgresql+psycopg2://postgres:postgres@localhost:5432/docsupport
POSTGRES_PASSWORD=postgres

# Redis & Celery
REDIS_URL=redis://localhost:6379/0

# LLM Inference (Groq)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
GROQ_GUARD_MODEL=qwen/qwen3.8-27b

# Vector Embeddings
EMBEDDING_MODEL_NAME=BAAI/bge-base-en-v1.5
EMBEDDING_DIMENSION=768

# Authentication (Clerk)
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_JWKS_URL=https://api.clerk.com/v1/jwks

# Observability (Langfuse)
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_HOST=https://cloud.langfuse.com
LANGFUSE_ENABLED=True
```

---

## 💻 Local Development Setup

### Prerequisites
* Python 3.11+
* Node.js 20+ and npm
* Docker (for PostgreSQL + pgvector and Redis)

### Step 1: Start Database and Redis
```bash
# Start pgvector PostgreSQL container
docker run -d --name docsupport-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=docsupport \
  -p 5432:5432 \
  pgvector/pgvector:pg16

# Start Redis container
docker run -d --name docsupport-redis \
  -p 6379:6379 \
  redis:7-alpine
```

### Step 2: Configure & Run Backend
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

In a separate terminal, start the Celery background worker:
```bash
cd backend
# Windows: using threads or solo pool
celery -A app.celery_app worker --loglevel=info --pool=solo
# Linux/macOS
celery -A app.celery_app worker --loglevel=info --concurrency=2
```

### Step 3: Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🐳 Docker Compose Deployment

To build and run all services (FastAPI, Celery Worker, PostgreSQL with pgvector, Redis, and React Frontend) with a single command:

```bash
docker compose up --build
```

* **Frontend UI**: `http://localhost:5173`
* **Backend API Docs**: `http://localhost:8000/docs` & `http://localhost:8000/doc`
* **PostgreSQL pgvector**: `localhost:5432`
* **Redis Queue**: `localhost:6379`

---

## ☁️ Render Cloud Deployment

DocSupport includes a native Render Blueprint specification (`render.yaml`) to automate deployment across Render services:

1. Push your repository to GitHub.
2. Log into [Render.com](https://render.com) and click **New +** ➔ **Blueprint**.
3. Select your repository. Render will automatically configure:
   - `docsupport-api`: FastAPI Web Service.
   - `docsupport-worker`: Celery Background Worker.
   - `docsupport-ui`: Static React Web Site.
   - `docsupport-redis`: Managed Redis Instance.
   - `docsupport-db`: PostgreSQL 16 Database with `pgvector`.
4. Supply your secret environment variables (`GROQ_API_KEY`, `CLERK_SECRET_KEY`, `LANGFUSE_SECRET_KEY`) in the Render dashboard and deploy.

---

## 📡 API Documentation & Available Endpoints

Interactive Swagger documentation is available at `http://localhost:8000/docs` (with a redirect alias at `/doc`).

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health and readiness check |
| `GET` | `/api/documents` | List indexed knowledge sources with status filter |
| `GET` | `/api/documents/{id}` | Retrieve document metadata and chunk count |
| `DELETE` | `/api/documents/{id}` | Delete document and cascade delete all vector chunks |
| `POST` | `/api/documents/upload` | Upload and vectorize PDF document |
| `POST` | `/api/documents/web` | Ingest and parse webpage URL |
| `POST` | `/api/documents/youtube` | Extract and index YouTube transcripts |
| `POST` | `/api/documents/text` | Ingest raw text or markdown notes |
| `POST` | `/api/query` | Execute LangGraph RAG workflow with citations |

---

## 🧪 Testing & Evaluation

DocSupport includes an automated end-to-end evaluation suite (`backend/test_e2e_rag.py`) that validates the complete RAG graph against three critical operational conditions:

1. **Grounded Query Test**: Verifies that queries backed by relevant indexed context return accurate answers with valid citations.
2. **Missing Evidence Abstention Test**: Verifies that out-of-context or irrelevant queries trigger the deterministic abstention guardrail instead of hallucinations.
3. **Prompt Injection Guard Test**: Verifies that adversarial prompts (e.g., `"ignore previous instructions"`) are intercepted and rejected early by the input guardrail.

To execute the evaluation script:
```bash
cd backend
python test_e2e_rag.py
```

All evaluation runs stream trace spans and grounding scores directly to Langfuse for continuous verification.

---

## 🔧 Troubleshooting

* **pgvector Extension Missing**: Ensure the PostgreSQL container is using the `pgvector/pgvector:pg16` image and that `CREATE EXTENSION IF NOT EXISTS vector;` has executed.
* **Celery Worker Connection**: If running locally without Celery workers, DocSupport automatically falls back to daemon background threads so document ingestion never stalls in `QUEUED` status.
* **Groq API Rate Limits**: When Groq rate limits are reached, the system gracefully falls back to deterministic token-overlap extraction and flags the observation in Langfuse traces.
