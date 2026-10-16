import React from 'react';
import { 
  Database, 
  MessageSquare, 
  BookOpen, 
  Sun, 
  Moon, 
  Sparkles, 
  GitBranch, 
  Cpu, 
  ExternalLink,
  ShieldCheck,
  User
} from 'lucide-react';
import { useTheme } from './ThemeContext';

interface SidebarProps {
  activeTab: 'dashboard' | 'qa';
  setActiveTab: (tab: 'dashboard' | 'qa') => void;
  documentCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  documentCount,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-cyber-border bg-white dark:bg-cyber-card flex flex-col justify-between shrink-0 select-none transition-colors duration-200">
      {/* Brand & Logo */}
      <div>
        <div className="p-6 border-b border-slate-100 dark:border-cyber-border/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-glow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                DocSupport
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                  RAG
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Enterprise Git & Docs AI</p>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <div className="p-4 space-y-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Knowledge Base</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {documentCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('qa')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
              activeTab === 'qa'
                ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-indigo-500" />
              <span>Q&A Workspace</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <a
            href="http://localhost:8000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Swagger API Docs</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>

        {/* Engine Specs Pill */}
        <div className="px-4 py-3 mx-4 my-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-cyber-border text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5 font-mono">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Cpu className="w-3 h-3 text-indigo-500" />
              Vector Engine
            </span>
            <span className="text-emerald-500 font-semibold">pgvector 768d</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <GitBranch className="w-3 h-3 text-emerald-500" />
              GitLoader
            </span>
            <span className="text-indigo-400 font-semibold">Active</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-3 h-3 text-amber-500" />
              Dual Guard
            </span>
            <span className="text-amber-500 font-semibold">Enforced</span>
          </div>
        </div>
      </div>

      {/* Footer / Controls */}
      <div className="p-4 border-t border-slate-100 dark:border-cyber-border/60 space-y-3">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium border border-slate-200 dark:border-cyber-border bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <div className="flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
            <span>{theme === 'dark' ? 'Cyber Slate Dark' : 'Octet Lilac Light'}</span>
          </div>
          <span className="text-[10px] text-slate-400 capitalize">{theme}</span>
        </button>

        {/* User Card */}
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-cyber-border">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
            <User className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              Enterprise User
            </div>
            <div className="text-[10px] text-emerald-500 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              JWT Authenticated
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
