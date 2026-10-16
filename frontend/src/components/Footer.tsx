import React from 'react';
import { ExternalLink } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: 'landing' | 'login' | 'terms' | 'app') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#F5F5F7] dark:bg-[#161617] border-t border-[#D2D2D7]/50 dark:border-white/10 text-[#86868B] dark:text-[#A1A1A6] text-[11px] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
        {/* Editorial Footnotes & System Disclosures */}
        <div className="space-y-2 pb-8 border-b border-[#D2D2D7]/50 dark:border-white/10 leading-relaxed max-w-4xl">
          <p>
            1. GitLoader performs shallow clones (<code className="text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">depth=1</code>) in isolated ephemeral directories. Cloned files are cleaned up immediately following vectorization to safeguard host disk resources.
          </p>
          <p>
            2. The Dual Guardrail Engine operates via a compiled LangGraph state machine. When source context does not contain direct factual corroboration, the model explicitly abstains with the exact phrase <em className="text-[#1D1D1F] dark:text-[#F5F5F7]">&ldquo;I am unable to answer this question based on the provided document.&rdquo;</em>
          </p>
          <p>
            3. All vector embeddings are 768-dimensional normalized vectors (<code className="text-[#1D1D1F] dark:text-[#F5F5F7] font-mono">BAAI/bge-base-en-v1.5</code>) indexed with PostgreSQL pgvector HNSW cosine distance operators.
          </p>
        </div>

        {/* Directory Navigation Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8 py-8 border-b border-[#D2D2D7]/50 dark:border-white/10 text-[12px]">
          {/* Column 1: Capabilities */}
          <div>
            <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
              Capabilities
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('app')}
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors text-left"
                >
                  GitLoader Code Indexing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('app')}
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors text-left"
                >
                  Dual Guardrail Engine
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('app')}
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors text-left"
                >
                  Page-Mapped PDF Ingestion
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('app')}
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors text-left"
                >
                  Timestamped Video Transcripts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('app')}
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors text-left"
                >
                  Web Document Extraction
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
              Platform & Tools
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('app')}
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors text-left"
                >
                  Knowledge Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('app')}
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors text-left"
                >
                  Interactive Q&A Workspace
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors text-left"
                >
                  Account Sign In
                </button>
              </li>
              <li>
                <a
                  href="https://cloud.langfuse.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors inline-flex items-center gap-1"
                >
                  <span>Langfuse Tracing</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Developer & API */}
          <div>
            <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
              Developer & API
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors inline-flex items-center gap-1"
                >
                  <span>Swagger OpenAPI Spec</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8000/doc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors inline-flex items-center gap-1"
                >
                  <span>FastAPI /doc Redirect</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8000/health"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors inline-flex items-center gap-1 font-mono"
                >
                  <span>GET /health</span>
                </a>
              </li>
              <li>
                <a
                  href="http://localhost:8000/ready"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors inline-flex items-center gap-1 font-mono"
                >
                  <span>GET /ready</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Governance */}
          <div>
            <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">
              Legal & Policy
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors text-left font-medium"
                >
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors text-left"
                >
                  AI Grounding Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-[#0071E3] dark:hover:text-[#2997FF] transition-colors text-left"
                >
                  Repository Data Privacy
                </button>
              </li>
              <li>
                <span className="text-[#86868B]/70">Security & PAT Safety</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Port Architecture */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[#86868B] dark:text-[#A1A1A6]">
          <div>
            Copyright &copy; {new Date().getFullYear()} DocSupport RAG Platform. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px]">
            <span>Frontend: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">5173</strong></span>
            <span>&bull;</span>
            <span>API: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">8000</strong></span>
            <span>&bull;</span>
            <span>pgvector: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">5432</strong></span>
            <span>&bull;</span>
            <span>Redis: <strong className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold">6379</strong></span>
          </div>
        </div>
      </div>
    </footer>
  );
};
