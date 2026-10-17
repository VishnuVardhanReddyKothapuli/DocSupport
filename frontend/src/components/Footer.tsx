import React from 'react';

interface FooterProps {
  onNavigate: (route: 'landing' | 'login' | 'terms' | 'app') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-[#F5F5F7] dark:bg-[#161617] border-t border-[#D2D2D7]/50 dark:border-white/10 text-[#86868B] dark:text-[#A1A1A6] text-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Navigation Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 pb-10 border-b border-[#D2D2D7]/50 dark:border-white/10">
          {/* Column 1: Capabilities */}
          <div>
            <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-3 text-xs tracking-tight">
              Capabilities
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate('app')}
                  className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors text-left"
                >
                  Document Ingestion
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('app')}
                  className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors text-left"
                >
                  Semantic Vector Search
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('app')}
                  className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors text-left"
                >
                  Dual Guardrails &amp; Abstention
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('app')}
                  className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors text-left"
                >
                  Verbatim Source Citations
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-3 text-xs tracking-tight">
              Platform
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate('app')}
                  className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors text-left"
                >
                  Knowledge Base
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('app')}
                  className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors text-left"
                >
                  Q&amp;A Workspace
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('login')}
                  className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors text-left"
                >
                  Account Sign In
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Legal & Governance */}
          <div>
            <h4 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-3 text-xs tracking-tight">
              Legal &amp; Privacy
            </h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors text-left"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors text-left"
                >
                  AI Grounding Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors text-left"
                >
                  Data Privacy &amp; Isolation
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Clean Copyright & Legal links only */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#86868B]">
          <div className="flex items-center gap-2">
            <img
              src="/logo-icon.png"
              alt="DocSupport Logo"
              className="w-4 h-4 rounded object-contain opacity-80"
            />
            <span>Copyright &copy; {new Date().getFullYear()} DocSupport. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('terms')}
              className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors"
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
