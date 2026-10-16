import React, { useState } from 'react';
import { 
  ArrowRight, 
  GitBranch, 
  ShieldCheck, 
  Database, 
  FileCode, 
  FileText, 
  Globe, 
  Video, 
  Check, 
  ChevronRight, 
  Code2, 
  Terminal, 
  ShieldAlert,
  Clock,
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface LandingPageProps {
  onNavigate: (route: 'landing' | 'login' | 'terms' | 'app') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const [activePreviewTab, setActivePreviewTab] = useState<'git' | 'pdf' | 'guardrail'>('git');

  return (
    <div className="min-h-screen bg-[#FBFBFD] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-200 selection:bg-[#0071E3] selection:text-white flex flex-col justify-between">
      {/* Global Apple-Style Navigation */}
      <Navbar currentRoute="landing" onNavigate={onNavigate} />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-16 pb-20 md:pt-28 md:pb-28 px-6 max-w-7xl mx-auto text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 text-[#6E6E73] dark:text-[#A1A1A6] text-xs font-medium mb-6">
            <span>DocSupport Enterprise RAG</span>
            <span className="w-1 h-1 rounded-full bg-[#86868B]"></span>
            <span>GitLoader &bull; LangGraph &bull; Langfuse</span>
          </div>

          {/* Large confident display headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-[-0.03em] leading-[1.06] text-[#1D1D1F] dark:text-[#F5F5F7] max-w-5xl mx-auto">
            Intelligence grounded in your code.
            <br />
            <span className="text-[#86868B] dark:text-[#A1A1A6]">
              Verified to the exact line.
            </span>
          </h1>

          {/* Concise supporting copy */}
          <p className="mt-6 md:mt-8 text-lg sm:text-xl md:text-2xl text-[#6E6E73] dark:text-[#A1A1A6] max-w-2xl mx-auto font-normal leading-relaxed tracking-tight">
            Ingest entire Git repositories, technical PDFs, and documentation. Sub-second vector retrieval on PostgreSQL pgvector, with a LangGraph state machine that explicitly abstains when evidence is missing.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="mt-8 md:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate('app')}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-sm transition-all shadow-subtle flex items-center justify-center gap-2"
            >
              <span>Launch Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-sm transition-all flex items-center justify-center gap-1.5"
            >
              <span>Explore API Spec</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#86868B]" />
            </a>
          </div>

          {/* REAL PRODUCT PREVIEW INTERFACE */}
          <div className="mt-14 md:mt-20 max-w-5xl mx-auto rounded-2xl md:rounded-3xl border border-[#D2D2D7]/70 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#161617] shadow-elevated dark:shadow-dark-elevated overflow-hidden text-left">
            {/* Window titlebar */}
            <div className="px-5 py-3.5 border-b border-[#D2D2D7]/50 dark:border-white/10 bg-[#F5F5F7] dark:bg-[#1D1D1F] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]/80"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/80"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F]/80"></div>
                <span className="ml-3 text-xs font-mono text-[#86868B] dark:text-[#A1A1A6] hidden sm:inline-block">
                  docsupport-workspace &bull; git:github.com/fastapi/fastapi (main:e4f9b2c)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#86868B]">
                <Clock className="w-3 h-3 text-[#0071E3]" />
                <span>142ms retrieval &bull; pgvector 768d</span>
              </div>
            </div>

            {/* Preview Body (Split View) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px]">
              {/* Left Column: Chat Conversation Stream */}
              <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-[#D2D2D7]/50 dark:border-white/10 flex flex-col justify-between">
                <div className="space-y-4">
                  {/* User Query Bubble */}
                  <div className="flex justify-end">
                    <div className="max-w-md bg-[#0071E3] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs md:text-sm leading-relaxed">
                      How does the dependency injection system resolve scoped yields and teardowns in FastAPI?
                    </div>
                  </div>

                  {/* Assistant Grounded Answer */}
                  <div className="p-4 rounded-xl bg-[#F5F5F7] dark:bg-[#1D1D1F] border border-[#D2D2D7]/40 dark:border-white/5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#86868B]">
                      <span className="flex items-center gap-1.5 text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                        Grounded Response
                      </span>
                      <span>Groq llama-3.3-70b</span>
                    </div>
                    <p className="text-xs md:text-sm leading-relaxed text-[#1D1D1F] dark:text-[#F5F5F7]">
                      FastAPI executes dependency resolution via an asynchronous exit stack context manager. When a dependency uses a <code className="px-1 py-0.5 rounded bg-black/5 dark:bg-white/10 font-mono text-xs">yield</code> statement, execution pauses at the yield point while the endpoint runs, and finalizers execute during request teardown in reverse dependency order <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-[#0071E3]/10 text-[#0071E3] font-mono text-xs font-semibold cursor-pointer">[1]</span>.
                    </p>
                  </div>
                </div>

                {/* Query Input simulation */}
                <div className="mt-6 pt-4 border-t border-[#D2D2D7]/40 dark:border-white/10 flex items-center justify-between text-xs text-[#86868B]">
                  <span className="font-mono">Input Guard: Sanitized (0 injections detected)</span>
                  <span className="text-[#0071E3] font-medium">Dual Guardrail: Grounded</span>
                </div>
              </div>

              {/* Right Column: Verbatim Evidence Inspector */}
              <div className="lg:col-span-5 p-6 bg-[#FBFBFD] dark:bg-[#111112] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-[#D2D2D7]/50 dark:border-white/10 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] flex items-center gap-1.5">
                      <Code2 className="w-3.5 h-3.5 text-[#0071E3]" />
                      Citation [1] Evidence
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] font-semibold">
                      94.2% Cosine Match
                    </span>
                  </div>

                  <div className="space-y-1 text-xs font-mono text-[#86868B] mb-3">
                    <div className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold truncate">
                      fastapi/dependencies/utils.py
                    </div>
                    <div>Lines 145 &ndash; 182 &bull; commit: e4f9b2c</div>
                  </div>

                  {/* Verbatim Code Chunk */}
                  <pre className="p-3.5 rounded-xl bg-[#F5F5F7] dark:bg-[#1A1A1C] border border-[#D2D2D7]/40 dark:border-white/10 text-[11px] font-mono text-[#1D1D1F] dark:text-[#F5F5F7] overflow-x-auto leading-relaxed">
{`async def solve_dependencies(
    *,
    request: Request,
    dependant: Dependant,
    async_exit_stack: AsyncExitStack,
):
    # Yield-dependency execution
    if is_gen_callable(call):
        cm = contextmanager_in_threadpool(...)
        yielded = await async_exit_stack.enter_async_context(cm)
        return yielded`}
                  </pre>
                </div>

                <div className="text-[11px] text-[#86868B] pt-4 border-t border-[#D2D2D7]/40 dark:border-white/10 flex items-center justify-between">
                  <span>pgvector HNSW Cosine Index</span>
                  <span className="font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">Vector(768)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: GITLOADER ENGINE STORYTELLING */}
        <section id="gitloader" className="py-20 md:py-32 px-6 border-t border-[#D2D2D7]/50 dark:border-white/10 bg-[#F5F5F7] dark:bg-[#161617]/40">
          <div className="max-w-7xl mx-auto">
            {/* Editorial Heading */}
            <div className="max-w-3xl mb-14 md:mb-20">
              <span className="text-xs font-semibold tracking-wider uppercase text-[#0071E3] mb-3 block">
                GitLoader Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
                Your entire repository.
                <br />
                <span className="text-[#86868B]">Indexed down to commit and line numbers.</span>
              </h2>
              <p className="mt-4 text-base md:text-lg text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed">
                Connect GitHub, GitLab, or private repositories. GitLoader executes shallow clones with automatic filetype filtering, AST module header injection, and line tracking—deleting temporary directories immediately after vectorization.
              </p>
            </div>

            {/* Asymmetrical 2-Column Presentation */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Feature explanation points */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <span className="w-6 h-6 rounded-full bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] flex items-center justify-center text-xs">1</span>
                    Shallow Clone &amp; Ephemeral Isolation
                  </div>
                  <p className="text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6] pl-8 leading-relaxed">
                    Clones remote repositories using <code className="text-[#0071E3] font-mono">--depth 1</code> targeting specific branches or tags. Directories are created in isolated temporary storage and destroyed in a guaranteed <code className="font-mono">finally</code> block.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <span className="w-6 h-6 rounded-full bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] flex items-center justify-center text-xs">2</span>
                    Intelligent Language &amp; Asset Filtering
                  </div>
                  <p className="text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6] pl-8 leading-relaxed">
                    Filters 15+ code extensions (<code className="font-mono text-xs">.py, .ts, .tsx, .rs, .go, .java, .sql</code>), automatically discarding lockfiles, binary files, minified assets, and test fixtures over 1 MB.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <span className="w-6 h-6 rounded-full bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] flex items-center justify-center text-xs">3</span>
                    Architectural Header Injection
                  </div>
                  <p className="text-xs md:text-sm text-[#6E6E73] dark:text-[#A1A1A6] pl-8 leading-relaxed">
                    Prepends file path and line context (<code className="font-mono text-xs">// File: src/auth.ts | Lines 12-45</code>) to each chunk so embeddings retain architectural context even for isolated snippets.
                  </p>
                </div>
              </div>

              {/* Code visual preview */}
              <div className="lg:col-span-7 bg-[#FFFFFF] dark:bg-[#111112] border border-[#D2D2D7]/60 dark:border-white/10 rounded-2xl p-6 shadow-subtle">
                <div className="flex items-center justify-between pb-3 border-b border-[#D2D2D7]/40 dark:border-white/10 mb-4 text-xs font-mono text-[#86868B]">
                  <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">GitLoader Chunk Structure</span>
                  <span>pgvector metadata schema</span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-[#F5F5F7] dark:bg-[#1D1D1F] text-[#6E6E73] dark:text-[#A1A1A6] text-[11px]">
                    <span className="text-[#0071E3] font-semibold">// Injected Architectural Context Header</span><br />
                    // File: backend/app/auth/service.py | Lines: 42-88 | Language: python
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#F5F5F7] dark:bg-[#1A1A1C] text-[#1D1D1F] dark:text-[#F5F5F7] text-xs">
                    {`class KeyManager:
    """Manages JWKS public keys and token rotation."""
    def verify_token(self, token: str) -> Claims:
        header = jwt.get_unverified_header(token)
        key = self.get_jwks_key(header["kid"])
        return jwt.decode(token, key, algorithms=["RS256"])`}
                  </div>

                  <div className="p-3 rounded-lg bg-[#F5F5F7] dark:bg-[#1D1D1F] text-[11px] text-[#6E6E73] dark:text-[#A1A1A6]">
                    <span className="text-[#86868B]">JSONB Metadata: </span>
                    {`{ "file_path": "backend/app/auth/service.py", "line_start": 42, "line_end": 88, "commit": "3bf910a" }`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: DUAL GUARDRAILS & LANGGRAPH (ZERO HALLUCINATION) */}
        <section id="guardrails" className="py-20 md:py-32 px-6 border-t border-[#D2D2D7]/50 dark:border-white/10 max-w-7xl mx-auto">
          <div className="max-w-3xl mb-14 md:mb-20">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#0071E3] mb-3 block">
              Dual Guardrail Engine
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
              Strictly grounded.
              <br />
              <span className="text-[#86868B]">Explicitly abstaining when evidence is missing.</span>
            </h2>
            <p className="mt-4 text-base md:text-lg text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed">
              Standard AI systems guess when they do not know. DocSupport enforces a multi-node LangGraph state machine with input prompt injection sanitization and output grounding verification.
            </p>
          </div>

          {/* LangGraph Pipeline Steps (Visual Horizontal Layout) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-16">
            {[
              { num: '01', title: 'Input Guard', desc: 'Sanitizes queries and intercepts jailbreaks or prompt injections.' },
              { num: '02', title: 'pgvector Search', desc: 'Sub-second cosine similarity retrieval across 768d vectors.' },
              { num: '03', title: 'Evidence Grade', desc: 'Evaluates if retrieved chunks meet minimum relevance thresholds.' },
              { num: '04', title: 'Groq 70B LLM', desc: 'Inference with temperature 0.1 and strict context constraints.' },
              { num: '05', title: 'Output Guard', desc: 'Verifies verbatim citations or enforces explicit abstention.' },
            ].map((step, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-[#D2D2D7]/60 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#161617] flex flex-col justify-between"
              >
                <div>
                  <div className="text-xs font-mono font-semibold text-[#86868B] mb-2">{step.num}</div>
                  <h3 className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">{step.title}</h3>
                  <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Side-by-Side Reality Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard AI Behavior */}
            <div className="p-6 rounded-2xl border border-rose-200 dark:border-rose-950/40 bg-rose-50/30 dark:bg-rose-950/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4" />
                Generic AI Assistant (Unconstrained)
              </div>
              <h4 className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                User asks about an undocumented API or missing parameter:
              </h4>
              <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed italic">
                &ldquo;You can configure this using <code className="text-rose-500">FastAPI.set_scoped_cache(True)</code>...&rdquo;
              </p>
              <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                &times; Hallucinated nonexistent function. Causes deployment failures.
              </div>
            </div>

            {/* DocSupport Guardrail Behavior */}
            <div className="p-6 rounded-2xl border border-emerald-200 dark:border-emerald-950/40 bg-emerald-50/30 dark:bg-emerald-950/10 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                DocSupport Dual Guardrail Engine
              </div>
              <h4 className="text-sm font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                User asks about an undocumented API or missing parameter:
              </h4>
              <p className="text-xs text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed font-semibold">
                &ldquo;I am unable to answer this question based on the provided document.&rdquo;
              </p>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                &check; Verified evidence missing. Explicitly abstains rather than misleading engineers.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: MULTI-SOURCE INGESTION CAPABILITIES */}
        <section id="features" className="py-20 md:py-32 px-6 border-t border-[#D2D2D7]/50 dark:border-white/10 bg-[#F5F5F7] dark:bg-[#161617]/40">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl mb-14 md:mb-20">
              <span className="text-xs font-semibold tracking-wider uppercase text-[#0071E3] mb-3 block">
                Multi-Source Knowledge
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] leading-tight">
                Unified vectorization.
                <br />
                <span className="text-[#86868B]">For every technical asset.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Git Repos */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111112] border border-[#D2D2D7]/60 dark:border-white/10 shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7] mb-4">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-base text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">Git Repositories</h3>
                  <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed">
                    Clone remote repositories with branch targeting, language filtering, commit hashing, and line number citations.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#D2D2D7]/40 dark:border-white/10 text-[11px] font-mono text-[#86868B]">
                  GitLoader &bull; 15+ Languages
                </div>
              </div>

              {/* PDF Documents */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111112] border border-[#D2D2D7]/60 dark:border-white/10 shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7] mb-4">
                    <FileText className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-base text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">Technical PDFs</h3>
                  <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed">
                    PyPDF extraction with page-level mapping. Every answer cites the exact document page number.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#D2D2D7]/40 dark:border-white/10 text-[11px] font-mono text-[#86868B]">
                  PyPDF &bull; Page Tracking
                </div>
              </div>

              {/* Web Pages */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111112] border border-[#D2D2D7]/60 dark:border-white/10 shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7] mb-4">
                    <Globe className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-base text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">Web Documentation</h3>
                  <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed">
                    Clean HTML text parsing via BeautifulSoup, preserving document hierarchy while removing scripts and ads.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#D2D2D7]/40 dark:border-white/10 text-[11px] font-mono text-[#86868B]">
                  BeautifulSoup &bull; Clean HTML
                </div>
              </div>

              {/* YouTube & Media */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] dark:bg-[#111112] border border-[#D2D2D7]/60 dark:border-white/10 shadow-subtle flex flex-col justify-between">
                <div>
                  <div className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-[#1D1D1F] dark:text-[#F5F5F7] mb-4">
                    <Video className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-base text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">Video Transcripts</h3>
                  <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] leading-relaxed">
                    Closed-caption transcript extraction with exact timeline timestamps mapped directly into vector chunks.
                  </p>
                </div>
                <div className="mt-6 pt-3 border-t border-[#D2D2D7]/40 dark:border-white/10 text-[11px] font-mono text-[#86868B]">
                  Transcripts &bull; Timestamps
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: EDITORIAL TECHNICAL SPECIFICATIONS MATRIX */}
        <section id="architecture" className="py-20 md:py-32 px-6 border-t border-[#D2D2D7]/50 dark:border-white/10 max-w-7xl mx-auto">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-semibold tracking-wider uppercase text-[#0071E3] mb-3 block">
              Technical Specifications
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Engineered for precision.
            </h2>
          </div>

          <div className="border border-[#D2D2D7]/70 dark:border-white/10 rounded-2xl overflow-hidden bg-[#FFFFFF] dark:bg-[#161617] shadow-subtle">
            <table className="w-full text-left text-xs md:text-sm">
              <tbody className="divide-y divide-[#D2D2D7]/40 dark:divide-white/10">
                <tr>
                  <td className="py-4 px-6 font-medium text-[#86868B] w-1/3">Vector Database</td>
                  <td className="py-4 px-6 text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">PostgreSQL 16 with pgvector extension</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-[#86868B]">Vector Dimensions</td>
                  <td className="py-4 px-6 text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">768-dimensional normalized vectors (BAAI/bge-base-en-v1.5)</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-[#86868B]">Indexing Method</td>
                  <td className="py-4 px-6 text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">HNSW (vector_cosine_ops, m=16, ef_construction=64)</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-[#86868B]">Agent Framework</td>
                  <td className="py-4 px-6 text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">LangGraph StateGraph multi-node state machine</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-[#86868B]">Inference Engine</td>
                  <td className="py-4 px-6 text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">Groq API (llama-3.3-70b-versatile, openai/gpt-oss-120b)</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-[#86868B]">Observability &amp; Tracing</td>
                  <td className="py-4 px-6 text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">Langfuse Tracing, spans, and grounding evaluation scores</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-[#86868B]">Authentication</td>
                  <td className="py-4 px-6 text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">Clerk Auth (RS256 JWT validation via JWKS)</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-[#86868B]">Asynchronous Queue</td>
                  <td className="py-4 px-6 text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">Redis 7 + Celery background workers</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 5: FINAL CONVERSION BANNER */}
        <section className="py-20 md:py-28 px-6 border-t border-[#D2D2D7]/50 dark:border-white/10 bg-[#F5F5F7] dark:bg-[#161617]/40 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Start indexing your code today.
            </h2>
            <p className="mt-4 text-base md:text-lg text-[#6E6E73] dark:text-[#A1A1A6]">
              Launch the workspace to connect a repository, upload technical documents, and run grounded queries with zero hallucination.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => onNavigate('app')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-medium text-sm transition-all shadow-subtle flex items-center justify-center gap-2"
              >
                <span>Open Knowledge Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-[#1D1D1F] dark:text-[#F5F5F7] font-medium text-sm transition-all"
              >
                Sign In to Account
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Global Apple-Style Footer */}
      <Footer onNavigate={onNavigate} />
    </div>
  );
};
