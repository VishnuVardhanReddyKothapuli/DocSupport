import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Trash2, 
  MessageSquare, 
  ExternalLink, 
  Clock, 
  Database, 
  RefreshCw,
  AlertTriangle,
  FileCode,
  FileText,
  Globe,
  Video,
  AlignLeft,
  Sparkles
} from 'lucide-react';
import { DocumentItem } from '../api/sourceIngestion';
import { useTheme } from './ThemeContext';
import RubberSegment from './RubberSegment';
import { SpotlightCard } from './ui/card';
import { Badge } from './ui/badge';
import { MotionButton } from './ui/button';

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
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  const filterTabs = [
    { value: 'ALL', label: 'All Sources' },
    { value: 'PDF', label: 'PDF Documents' },
    { value: 'WEBSITE', label: 'Web Pages' },
    { value: 'YOUTUBE', label: 'Videos' },
    { value: 'TEXT', label: 'Notes & Text' },
  ];

  const filteredDocs = documents.filter((doc) => {
    const matchesFilter = selectedFilter === 'ALL' || doc.source_type === selectedFilter;
    const matchesSearch =
      doc.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.source_url && doc.source_url.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.git_branch && doc.git_branch.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getSourceDetails = (type: string) => {
    switch (type) {
      case 'GIT':
        return { label: 'Repository', icon: FileCode, color: 'text-emerald-500' };
      case 'PDF':
        return { label: 'PDF Document', icon: FileText, color: 'text-blue-500' };
      case 'WEBSITE':
        return { label: 'Web Page', icon: Globe, color: 'text-indigo-500' };
      case 'YOUTUBE':
        return { label: 'Video Transcript', icon: Video, color: 'text-rose-500' };
      default:
        return { label: 'Text Document', icon: AlignLeft, color: 'text-amber-500' };
    }
  };

  const getStatusBadge = (status: string, reason?: string | null) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge variant="success" dot pulse>
            Ready
          </Badge>
        );
      case 'PROCESSING':
        return (
          <Badge variant="glow" dot pulse>
            Indexing
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="secondary" className="gap-1 font-mono text-[10px]">
            <Clock className="w-2.5 h-2.5" />
            Queued
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge variant="destructive" title={reason || 'Ingestion failed'} className="gap-1 cursor-help">
            <AlertTriangle className="w-2.5 h-2.5" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#FBFBFD] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-200">
      <div className="max-w-7xl mx-auto w-full px-6 py-8 md:py-10 flex flex-col flex-1">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between pb-8 mb-8 border-b border-[#D2D2D7]/50 dark:border-white/10 gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                Knowledge Base
              </h1>
              <Badge variant="secondary" className="font-mono text-[11px]">
                {documents.length} Sources
              </Badge>
            </div>
            <p className="text-sm text-[#6E6E73] dark:text-[#A1A1A6] max-w-2xl leading-relaxed">
              Indexed documentation, research papers, web articles, and media transcripts available for verified Q&amp;A.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <motion.button
              onClick={onRefresh}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2.5 rounded-full border border-[#D2D2D7]/60 dark:border-white/15 text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer"
              title="Refresh source records"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0071E3]' : ''}`} />
            </motion.button>

            <MotionButton
              onClick={onOpenUpload}
              variant="default"
              size="pill"
              className="flex-1 md:flex-initial gap-2 px-5 py-2.5 text-xs shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Source</span>
            </MotionButton>
          </div>
        </motion.div>

        {/* Filter Strip & Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6"
        >
          {/* Rubber Segmented Filter Control */}
          <div className="overflow-x-auto no-scrollbar py-0.5">
            <RubberSegment
              items={filterTabs}
              value={selectedFilter}
              onChange={(val) => setSelectedFilter(val)}
              equalSlots={false}
              size="md"
              radius={12}
              inset={3}
              stretch={90}
              squash={3}
              speed={1.05}
              trackColor={theme === 'dark' ? '#161617' : '#F5F5F7'}
              thumbColor={theme === 'dark' ? '#2C2C2E' : '#FFFFFF'}
              textColor={theme === 'dark' ? '#86868B' : '#6E6E73'}
              activeTextColor={theme === 'dark' ? '#F5F5F7' : '#1D1D1F'}
              className="border border-[#D2D2D7]/50 dark:border-white/10 shadow-xs"
              aria-label="Filter documents by source type"
            />
          </div>

          {/* Minimal Search Field */}
          <div className="relative min-w-[260px] sm:w-72">
            <Search className="w-3.5 h-3.5 text-[#86868B] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search sources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border border-[#D2D2D7]/60 dark:border-white/10 bg-white dark:bg-[#161617] text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#0071E3] transition-colors shadow-xs"
            />
          </div>
        </motion.div>

        {/* Source Cards Grid */}
        {filteredDocs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-[#D2D2D7] dark:border-white/15 bg-white/40 dark:bg-[#161617]/30 my-4"
          >
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center mb-3 shadow-xs"
            >
              <Database className="w-6 h-6 text-[#0071E3]" />
            </motion.div>
            <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-base">
              No knowledge sources found
            </h3>
            <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] max-w-sm mt-1.5 mb-6 leading-relaxed">
              {searchQuery
                ? 'No sources match the filter query.'
                : 'Add a document, webpage, or media transcript to begin asking questions.'}
            </p>
            <MotionButton
              onClick={onOpenUpload}
              variant="default"
              size="pill"
              className="gap-2 px-5 py-2 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Source</span>
            </MotionButton>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.06 },
              },
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filteredDocs.map((doc) => {
              const details = getSourceDetails(doc.source_type);
              const SourceIcon = details.icon;

              return (
                <motion.div
                  key={doc.id}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                >
                  <SpotlightCard className="p-5 h-full flex flex-col justify-between">
                    <div>
                      {/* Card Header: Plain source label and status */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[11px] text-[#86868B] font-medium flex items-center gap-1.5">
                          <SourceIcon className={`w-3.5 h-3.5 ${details.color}`} />
                          {details.label}
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
                    </div>

                    {/* Card Footer */}
                    <div className="mt-5 pt-3.5 border-t border-[#D2D2D7]/40 dark:border-white/10 flex items-center justify-between text-xs">
                      <div className="text-[11px] font-mono text-[#86868B]">
                        {doc.chunk_count} chunks
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDeleteDocument(doc.id)}
                          className="p-1.5 rounded-md text-[#86868B] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 transition-colors cursor-pointer"
                          title="Delete source"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>

                        <MotionButton
                          onClick={() => onSelectForQA(doc)}
                          disabled={doc.status !== 'COMPLETED'}
                          variant={doc.status === 'COMPLETED' ? 'default' : 'secondary'}
                          size="sm"
                          className="gap-1.5 rounded-full text-xs font-medium"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Open Q&amp;A</span>
                        </MotionButton>
                      </div>
                    </div>
                  </SpotlightCard>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
};
