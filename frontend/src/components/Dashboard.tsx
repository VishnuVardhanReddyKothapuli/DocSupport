import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  MessageSquare, 
  ExternalLink, 
  Clock, 
  FolderGit2, 
  RefreshCw,
  AlertTriangle
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

  const getSourceLabel = (type: string) => {
    switch (type) {
      case 'GIT':
        return 'Repository';
      case 'PDF':
        return 'PDF';
      case 'WEBSITE':
        return 'Web Page';
      case 'YOUTUBE':
        return 'Video Transcript';
      default:
        return 'Text Document';
    }
  };

  const getStatusBadge = (status: string, reason?: string | null) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#34C759]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
            Ready
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#0071E3]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3] animate-pulse" />
            Indexing
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-[#FF9500]">
            <Clock className="w-3 h-3" />
            Queued
          </span>
        );
      case 'FAILED':
        return (
          <span
            title={reason || 'Ingestion failed'}
            className="inline-flex items-center gap-1.5 text-[11px] text-[#FF3B30] cursor-help"
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
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#FBFBFD] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-200">
      <div className="max-w-7xl mx-auto w-full px-6 py-8 md:py-10 flex flex-col flex-1">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between pb-8 mb-8 border-b border-[#D2D2D7]/50 dark:border-white/10 gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
              Knowledge Base
            </h1>
            <p className="text-sm text-[#6E6E73] dark:text-[#A1A1A6] mt-1.5 max-w-2xl leading-relaxed">
              Indexed documentation, repositories, and technical sources available for Q&amp;A.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-full border border-[#D2D2D7]/60 dark:border-white/15 text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              title="Refresh source records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0071E3]' : ''}`} />
            </button>

            <button
              onClick={onOpenUpload}
              className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] font-medium text-xs hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Source</span>
            </button>
          </div>
        </div>

        {/* Filter Strip & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
          {/* Segmented Control */}
          <div className="flex items-center p-1 rounded-xl bg-[#F5F5F7] dark:bg-[#161617] border border-[#D2D2D7]/40 dark:border-white/10 overflow-x-auto no-scrollbar gap-1">
            {[
              { id: 'ALL', label: 'All Sources' },
              { id: 'GIT', label: 'Repositories' },
              { id: 'PDF', label: 'PDF Documents' },
              { id: 'WEBSITE', label: 'Web Pages' },
              { id: 'YOUTUBE', label: 'Videos' },
              { id: 'TEXT', label: 'Text' },
            ].map((tab) => {
              const isSelected = selectedFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-white dark:bg-[#2C2C2E] text-[#1D1D1F] dark:text-[#F5F5F7] shadow-sm font-semibold'
                      : 'text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Minimal Search Field */}
          <div className="relative min-w-[260px] sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-[#D2D2D7]/60 dark:border-white/10 bg-white dark:bg-[#161617] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#0071E3] transition-colors"
            />
          </div>
        </div>

        {/* Source Cards Grid */}
        {filteredDocs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-[#D2D2D7] dark:border-white/15 bg-white/40 dark:bg-[#161617]/30 my-4">
            <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center mb-3">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-base">
              No knowledge sources found
            </h3>
            <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] max-w-sm mt-1.5 mb-6 leading-relaxed">
              {searchQuery
                ? 'No sources match the filter query.'
                : 'Add a repository, document, or webpage to begin asking questions.'}
            </p>
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Source</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="group bg-white dark:bg-[#161617] border border-[#D2D2D7]/60 dark:border-white/10 hover:border-[#1D1D1F]/30 dark:hover:border-white/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Plain source label and status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] text-[#86868B] font-medium">
                      {getSourceLabel(doc.source_type)}
                    </span>
                    {getStatusBadge(doc.status, doc.failure_reason)}
                  </div>

                  {/* Document Name */}
                  <h3 
                    className="font-semibold text-sm text-[#1D1D1F] dark:text-[#F5F5F7] truncate leading-tight" 
                    title={doc.original_name}
                  >
                    {doc.original_name}
                  </h3>

                  {/* Source URL / Link */}
                  {doc.source_url && (
                    <a
                      href={doc.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-[#86868B] hover:text-[#0071E3] dark:hover:text-[#2997FF] truncate flex items-center gap-1 mt-1 font-mono transition-colors"
                      title={doc.source_url}
                    >
                      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{doc.source_url}</span>
                    </a>
                  )}

                  {/* Branch info if repository */}
                  {doc.source_type === 'GIT' && doc.git_branch && (
                    <div className="text-[10px] text-[#86868B] font-mono mt-2">
                      branch: {doc.git_branch}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-3.5 border-t border-[#D2D2D7]/40 dark:border-white/10 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-[#86868B]">
                    {doc.chunk_count} chunks
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-1.5 rounded-md text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors"
                      title="Delete source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onSelectForQA(doc)}
                      disabled={doc.status !== 'COMPLETED'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        doc.status === 'COMPLETED'
                          ? 'bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] hover:opacity-90'
                          : 'bg-black/5 dark:bg-white/5 text-[#86868B] cursor-not-allowed opacity-50'
                      }`}
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Open Q&amp;A</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
