import React from 'react';
import { 
  Database, 
  MessageSquare, 
  BookOpen, 
  Sun, 
  Moon, 
  GitBranch, 
  Cpu, 
  ExternalLink,
  ShieldCheck,
  User,
  ArrowLeft,
  FileText,
  LogOut
} from 'lucide-react';
import { useTheme } from './ThemeContext';

interface SidebarProps {
  activeTab: 'dashboard' | 'qa';
  setActiveTab: (tab: 'dashboard' | 'qa') => void;
  documentCount: number;
  onNavigate?: (route: 'landing' | 'login' | 'terms' | 'app') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  documentCount,
  onNavigate,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 border-r border-[#D2D2D7]/50 dark:border-white/10 bg-[#F5F5F7] dark:bg-[#161617] flex flex-col justify-between shrink-0 select-none transition-colors duration-200">
      {/* Brand & Logo Header */}
      <div>
        <div className="p-5 border-b border-[#D2D2D7]/50 dark:border-white/10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate?.('landing')}
              className="flex items-center gap-2.5 group text-left focus:outline-none"
              title="Return to Product Overview"
            >
              <div className="w-7 h-7 rounded-lg bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] flex items-center justify-center font-bold text-xs tracking-tight shadow-sm">
                D
              </div>
              <div>
                <h1 className="font-semibold text-sm tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center gap-1.5">
                  DocSupport
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-black/5 dark:bg-white/10 text-[#6E6E73] dark:text-[#A1A1A6] font-medium border border-black/5 dark:border-white/5">
                    RAG
                  </span>
                </h1>
                <p className="text-[11px] text-[#86868B]">Git &amp; Document AI</p>
              </div>
            </button>
          </div>
        </div>

        {/* Navigation items */}
        <div className="p-3 space-y-1">
          {/* Back to Overview */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('landing')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
          )}

          <div className="pt-1 pb-1">
            <div className="h-px bg-[#D2D2D7]/40 dark:bg-white/5 mx-2" />
          </div>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm font-semibold'
                : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Database className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-[#0071E3]' : 'text-[#86868B]'}`} />
              <span>Knowledge Base</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#6E6E73] dark:text-[#A1A1A6]">
              {documentCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'qa'
                ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm font-semibold'
                : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className={`w-4 h-4 ${activeTab === 'qa' ? 'text-[#0071E3]' : 'text-[#86868B]'}`} />
              <span>Q&amp;A Workspace</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
          </button>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-3.5 h-3.5 text-[#86868B]" />
              <span>Swagger API Spec</span>
            </div>
            <ExternalLink className="w-3 h-3 text-[#86868B]" />
          </a>
        </div>

        {/* Engine Specs Pill */}
        <div className="p-3 mx-3 my-2 rounded-xl bg-white/70 dark:bg-[#1D1D1F] border border-[#D2D2D7]/50 dark:border-white/10 text-[11px] text-[#6E6E73] dark:text-[#A1A1A6] space-y-1.5 font-mono shadow-sm">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#1D1D1F] dark:text-[#F5F5F7]">
              <Cpu className="w-3 h-3 text-[#0071E3]" />
              Vector Engine
            </span>
            <span className="text-[#34C759] font-medium">pgvector 768d</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#1D1D1F] dark:text-[#F5F5F7]">
              <GitBranch className="w-3 h-3 text-[#0071E3]" />
              GitLoader
            </span>
            <span className="text-[#0071E3] font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#1D1D1F] dark:text-[#F5F5F7]">
              <ShieldCheck className="w-3 h-3 text-[#FF9500]" />
              Dual Guard
            </span>
            <span className="text-[#FF9500] font-medium">Enforced</span>
          </div>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="p-3 border-t border-[#D2D2D7]/50 dark:border-white/10 space-y-2">
        {/* Terms Link */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('terms')}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[11px] font-medium text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Terms &amp; Policies</span>
            </div>
            <span className="text-[10px] font-mono">v1.2</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border border-[#D2D2D7]/50 dark:border-white/10 bg-white dark:bg-[#1D1D1F] text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-[#FBFBFD] dark:hover:bg-[#2C2C2E] transition-all"
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-[#2997FF]" /> : <Sun className="w-3.5 h-3.5 text-[#FF9500]" />}
            <span>{theme === 'dark' ? 'Dark Theme' : 'Light Theme'}</span>
          </div>
          <span className="text-[10px] text-[#86868B] capitalize">{theme}</span>
        </button>

        {/* User Card */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white dark:bg-[#1D1D1F] border border-[#D2D2D7]/50 dark:border-white/10 shadow-sm">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/10 text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center font-bold text-xs shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] truncate">
                Enterprise Dev
              </div>
              <div className="text-[10px] text-[#34C759] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]"></span>
                Authenticated
              </div>
            </div>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('login')}
              className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] p-1 rounded-md transition-colors"
              title="Sign Out / Switch Account"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
