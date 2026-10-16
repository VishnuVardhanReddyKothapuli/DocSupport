import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  MessageSquare, 
  ExternalLink, 
  GitBranch, 
  FileText, 
  Globe, 
  Video, 
  AlignLeft, 
  CheckCircle2, 
  Loader2, 
  AlertTriangle, 
  Clock, 
  FolderGit2, 
  Database,
  ArrowUpRight,
  RefreshCw
} from 'lucide-react';
import { DocumentItem } from '../api/sourceIngestion';

interface DashboardProps {
  documents: DocumentItem[];
  loading: boolean;
  onRefresh: () => void;
  onOpenUpload: () => void;
  onDeleteDocument: (id: string) => void;
  onSelectForQA: (doc: DocumentItem) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  documents,
  loading,
  onRefresh,
  onOpenUpload,
  onDeleteDocument,
  onSelectForQA,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const filteredDocs = documents.filter((doc) => {
    const matchesFilter = selectedFilter === 'ALL' || doc.source_type === selectedFilter;
    const matchesSearch =
      doc.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.source_url && doc.source_url.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.git_branch && doc.git_branch.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'GIT':
        return <GitBranch className="w-4 h-4 text-emerald-500" />;
      case 'PDF':
        return <FileText className="w-4 h-4 text-blue-500" />;
      case 'WEBSITE':
        return <Globe className="w-4 h-4 text-indigo-500" />;
      case 'YOUTUBE':
        return <Video className="w-4 h-4 text-rose-500" />;
      default:
        return <AlignLeft className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusBadge = (status: string, reason?: string | null) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Ready
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Loader2 className="w-3 h-3 animate-spin" />
            Vectorizing
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3" />
            Queued
          </span>
        );
      case 'FAILED':
        return (
          <span
            title={reason || 'Ingestion failed'}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 cursor-help"
          >
            <AlertTriangle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-8 max-w-7xl mx-auto w-full">
      {/* Top Banner / Hero Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-cyber-border gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              LangGraph + GitLoader RAG
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Langfuse Monitored
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Knowledge Base & Codebase Index
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ingest repositories, technical documents, websites, and media with sub-second vector search & dual guardrails.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-cyber-border text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            title="Refresh documents"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-500' : ''}`} />
          </button>

          <button
            onClick={onOpenUpload}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-glow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Knowledge Source</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        {/* Source Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'ALL', label: 'All Sources', icon: Database },
            { id: 'GIT', label: 'Git Repos', icon: GitBranch },
            { id: 'PDF', label: 'PDFs', icon: FileText },
            { id: 'WEBSITE', label: 'Web Pages', icon: Globe },
            { id: 'YOUTUBE', label: 'YouTube', icon: Video },
            { id: 'TEXT', label: 'Raw Text', icon: AlignLeft },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-glow-sm'
                    : 'bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search sources by name, URL, or branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-cyber-border bg-white dark:bg-cyber-card text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Documents Grid / Table */}
      {filteredDocs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-cyber-border bg-slate-50/50 dark:bg-slate-900/20">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <FolderGit2 className="w-7 h-7" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">No knowledge sources found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-5">
            {searchQuery
              ? 'No sources matched your search filter. Try clearing the search query.'
              : 'Add your first Git repository codebase, PDF document, or web article to start asking grounded questions.'}
          </p>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-glow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Index New Source</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="group bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border hover:border-indigo-500/50 dark:hover:border-indigo-500/50 rounded-2xl p-5 shadow-sm hover:shadow-glow-sm transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header with Type & Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300">
                    {getSourceIcon(doc.source_type)}
                    <span className="font-semibold">{doc.source_type}</span>
                  </div>
                  {getStatusBadge(doc.status, doc.failure_reason)}
                </div>

                {/* Title */}
                <h4 className="font-semibold text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-500 transition-colors" title={doc.original_name}>
                  {doc.original_name}
                </h4>

                {/* Subtitle / Source URL / Branch */}
                {doc.source_url && (
                  <a
                    href={doc.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-slate-400 hover:text-indigo-400 truncate flex items-center gap-1 mt-1 font-mono"
                    title={doc.source_url}
                  >
                    <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{doc.source_url}</span>
                  </a>
                )}

                {/* Git Metadata Pills */}
                {doc.source_type === 'GIT' && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {doc.git_branch && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <GitBranch className="w-2.5 h-2.5" />
                        {doc.git_branch}
                      </span>
                    )}
                    {doc.git_commit_hash && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500" title={doc.git_commit_hash}>
                        commit:{doc.git_commit_hash.slice(0, 7)}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Footer info & action buttons */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-cyber-border/80 flex items-center justify-between">
                <div className="text-[11px] font-mono text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{doc.chunk_count}</span> chunks
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                    title="Delete knowledge source"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectForQA(doc)}
                    disabled={doc.status !== 'COMPLETED'}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      doc.status === 'COMPLETED'
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Q&A</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
