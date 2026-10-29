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

## ☁️ AWS Cloud Deployment Guide

DocSupport is production-ready for deployment on Amazon Web Services (AWS) using either **Amazon EC2 (Docker Compose)** or **AWS ECS Fargate (Enterprise Multi-Service)**.

### Architecture Topology on AWS

```text
[ Route 53 DNS ]
       │
       ▼
[ CloudFront CDN / ALB (SSL Termination) ]
       │
       ├───► Frontend (S3 Static Hosting or Nginx Container on Port 80)
       └───► Backend API (FastAPI on Port 8000)
                 │
                 ├───► Amazon RDS for PostgreSQL 16 (pgvector extension)
                 ├───► Amazon ElastiCache / Redis 7 (Broker & Result Cache)
                 ├───► Celery Worker (Async Ingestion & Embedding Worker)
                 └───► Groq & Gemini APIs (Dual Engine with Automatic Failover)
```

---

### Option A: Fast Deployment via AWS EC2 + Docker Compose

The fastest, most cost-effective path to launch DocSupport on AWS:

1. **Launch an EC2 Instance**:
   - AMI: **Ubuntu 24.04 LTS** (64-bit x86_64)
   - Instance Type: **t3.medium** or **t3.large** (recommended: 2 vCPUs, 4–8 GB RAM for embedding model caching)
   - Storage: 30 GB gp3 SSD
   - Security Group Inbound Rules:
     - `SSH` (Port 22) from your IP
     - `HTTP` (Port 80) from `0.0.0.0/0`
     - `HTTPS` (Port 443) from `0.0.0.0/0`
     - `Custom TCP` (Port 5173 and 8000) if accessing services directly before reverse-proxying

2. **Connect and Install Docker & Compose**:
   ```bash
   ssh -i your-key.pem ubuntu@<ec2-public-ip>

   # Install Docker and Compose plugin
   sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg
   sudo install -m 0755 -d /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   sudo chmod a+r /etc/apt/keyrings/docker.gpg
   echo "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt-get update && sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   sudo usermod -aG docker ubuntu
   newgrp docker
   ```

3. **Clone Repository & Configure `.env`**:
   ```bash
   git clone <your-repository-url> docsupport
   cd docsupport
   cp .env.example .env
   nano .env
   ```
   Set your production keys:
   - `PRIMARY_LLM_PROVIDER=groq`
   - `GROQ_API_KEY=<your_groq_api_key>`
   - `GEMINI_API_KEY=<your_gemini_api_key>`
   - `CLERK_PUBLISHABLE_KEY=<your_clerk_pk>`
   - `CLERK_SECRET_KEY=<your_clerk_sk>`
   - `CLERK_JWKS_URL=<your_clerk_jwks_url>`
   - `POSTGRES_PASSWORD=<strong_db_password>`
   - `VITE_API_URL=http://<ec2-public-ip>:8000` (or `https://api.yourdomain.com`)

4. **Launch Application**:
   ```bash
   docker compose up -d --build
   ```
   - Frontend UI: `http://<ec2-public-ip>:5173`
   - Backend API Docs: `http://<ec2-public-ip>:8000/docs`
   - Health check: `http://<ec2-public-ip>:8000/health` or `/api/health`

---

### Option B: Enterprise Production via AWS ECS Fargate + RDS + CloudFront

For high availability, auto-scaling, and managed operations:

1. **Database — Amazon RDS for PostgreSQL 16**:
   - Engine: PostgreSQL 16.2+
   - Instance Class: `db.t4g.medium` or higher
   - Enable `pgvector`: Handled automatically on initial startup by `init_db()`.
   - Security Group: Allow inbound PostgreSQL (Port 5432) only from the ECS tasks security group.

2. **Broker / Cache — Amazon ElastiCache for Redis**:
   - Engine: Redis 7.x (or Valkey)
   - Node Type: `cache.t4g.micro` or `cache.t4g.small`
   - In-Transit Encryption: Supported via `rediss://` URL in `REDIS_URL`.

3. **Backend & Worker Images — Amazon ECR**:
   - Authenticate Docker to your Amazon ECR registry:
     ```bash
     aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <aws_account_id>.dkr.ecr.<region>.amazonaws.com
     ```
   - Build and push the backend container:
     ```bash
     docker build -t docsupport-backend ./backend
     docker tag docsupport-backend:latest <aws_account_id>.dkr.ecr.<region>.amazonaws.com/docsupport-backend:latest
     docker push <aws_account_id>.dkr.ecr.<region>.amazonaws.com/docsupport-backend:latest
     ```

4. **ECS Task Definitions**:
   - **Backend Service**:
     - Image: `<aws_account_id>.dkr.ecr.<region>.amazonaws.com/docsupport-backend:latest`
     - CPU: 1024 (1 vCPU), Memory: 2048 (2 GB)
     - Port Mapping: `8000`
     - Application Load Balancer Target Group: Health check path `/health` or `/api/health`
     - Environment Variables: Stored securely in AWS Systems Manager (SSM) Parameter Store or Secrets Manager.
   - **Celery Worker Service**:
     - Same ECR image with command override: `celery -A app.celery_app worker --loglevel=info --concurrency=2`
     - CPU: 1024, Memory: 2048

5. **Frontend Hosting — Amazon S3 + CloudFront**:
   - Build frontend assets with production backend URL:
     ```bash
     cd frontend
     VITE_API_URL=https://api.yourdomain.com VITE_CLERK_PUBLISHABLE_KEY=pk_live_... npm run build
     ```
   - Sync `dist/` to your S3 bucket:
     ```bash
     aws s3 sync dist/ s3://docsupport-frontend-bucket/ --delete
     ```
   - Configure **CloudFront Distribution**:
     - Default root object: `index.html`
     - Custom Error Response: HTTP 404 / 403 ➔ `/index.html` with HTTP 200 (SPA client routing).

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
