import React from 'react';
import { 
  Sparkles, 
  GitBranch, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Globe, 
  Video, 
  BookOpen,
  Lock,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-white flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-slate-200/80 dark:border-cyber-border bg-white/70 dark:bg-cyber-card/70 backdrop-blur-md sticky top-0 z-40 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-glow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">DocSupport</span>
              <span className="ml-1.5 text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                Enterprise RAG
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="http://localhost:8000/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-xl border border-slate-200 dark:border-cyber-border hidden sm:flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              API Docs
            </a>
            <button
              onClick={onEnterApp}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-glow-sm transition-all"
            >
              <span>Launch Platform</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 md:py-24 flex-1 flex flex-col items-center text-center">
        {/* Release Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-mono mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Full-Stack RAG with GitLoader + LangGraph + Langfuse</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-4xl text-slate-900 dark:text-white leading-[1.15]">
          Enterprise Intelligence for <br />
          <span className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            Codebases, Documents & Media
          </span>
        </h1>

        <p className="mt-6 text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Index entire Git repositories with commit-level citations, alongside PDFs, websites, and transcripts. 
          Powered by PostgreSQL pgvector, LangGraph dual-guardrail agent workflows, Groq inference, and Langfuse tracing.
        </p>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={onEnterApp}
            className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-glow-md hover:shadow-glow-lg transition-all"
          >
            <span>Open Knowledge Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-cyber-border bg-white dark:bg-cyber-card hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium text-sm transition-all"
          >
            <BookOpen className="w-4 h-4 text-indigo-500" />
            <span>FastAPI Swagger Spec</span>
          </a>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          {/* Feature 1: GitLoader */}
          <div className="p-6 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border shadow-sm hover:border-indigo-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              GitLoader Codebase Indexing
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Shallow clone remote repos, filter 15+ programming languages, inject module context headers, and extract exact file paths and commit hashes for citations.
            </p>
          </div>

          {/* Feature 2: Dual Guardrails & LangGraph */}
          <div className="p-6 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border shadow-sm hover:border-indigo-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              LangGraph Dual Guardrails
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              StateGraph state machine with input prompt injection sanitization, relevance verification, and output hallucination prevention. Abstains explicitly if evidence is missing.
            </p>
          </div>

          {/* Feature 3: Sub-second pgvector & Langfuse */}
          <div className="p-6 rounded-2xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border shadow-sm hover:border-indigo-500/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-4">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              pgvector & Langfuse Tracing
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              768-dimensional normalized BAAI embeddings with HNSW cosine distance indexes. Complete lifecycle observability and grounding scores logged to Langfuse.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-cyber-border/80 px-6 py-6 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
        <p>DocSupport Enterprise RAG Platform • Ports: Frontend 5173 • Backend 8000 • Postgres 5432 • Redis 6379</p>
      </footer>
    </div>
  );
};
