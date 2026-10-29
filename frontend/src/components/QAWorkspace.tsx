import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Database, 
  FileText, 
  ChevronRight, 
  Loader2,
  Quote,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DocumentItem } from '../api/sourceIngestion';
import { queryKnowledge, Citation } from '../api/queryResponse';
import { ChatMessage, Message } from './ChatMessage';
import { Badge } from './ui/badge';
import { MotionButton } from './ui/button';

interface QAWorkspaceProps {
  documents: DocumentItem[];
  selectedDoc: DocumentItem | null;
  onSelectDoc: (doc: DocumentItem) => void;
  onSwitchToDashboard: () => void;
}

export const QAWorkspace: React.FC<QAWorkspaceProps> = ({
  documents,
  selectedDoc,
  onSelectDoc,
  onSwitchToDashboard,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [topK, setTopK] = useState(5);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const completedDocs = documents.filter((d) => d.status === 'COMPLETED');

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputQuery.trim() || !selectedDoc || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: inputQuery.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = inputQuery.trim();
    setInputQuery('');
    setLoading(true);

    try {
      const response = await queryKnowledge(selectedDoc.id, currentQuery, topK);

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        content: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: response.citations,
        abstained: response.abstained,
        abstentionReason: response.abstention_reason,
        latencyMs: response.latency_ms,
        llmProvider: response.llm_provider,
        llmModel: response.llm_model,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      if (response.citations && response.citations.length > 0) {
        setSelectedCitation(response.citations[0]);
      }
    } catch (err: any) {
      const errMsg: Message = {
        id: `assistant-err-${Date.now()}`,
        sender: 'assistant',
        content: `Error executing query: ${err.response?.data?.detail || err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        abstained: true,
        abstentionReason: 'System communication failure',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-[#FBFBFD] dark:bg-[#000000] text-[#1D1D1F] dark:text-[#F5F5F7] transition-colors duration-200">
      {/* Central Chat Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden border-r border-[#D2D2D7]/50 dark:border-white/10">
        {/* Workspace Control Bar */}
        <div className="px-6 py-3 border-b border-[#D2D2D7]/50 dark:border-white/10 bg-[#F5F5F7]/80 dark:bg-[#161617]/80 backdrop-blur-sm flex items-center justify-between gap-4">
          {/* Target source selector */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="text-[11px] font-mono text-[#86868B] shrink-0 font-medium">
              Source:
            </span>
            <select
              value={selectedDoc?.id || ''}
              onChange={(e) => {
                const found = documents.find((d) => d.id === e.target.value);
                if (found) {
                  onSelectDoc(found);
                  setMessages([]);
                  setSelectedCitation(null);
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#D2D2D7]/60 dark:border-white/15 bg-white dark:bg-[#1D1D1F] text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] max-w-xs truncate shadow-sm cursor-pointer"
            >
              {completedDocs.length === 0 && <option value="">No ready sources</option>}
              {completedDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_name}
                </option>
              ))}
            </select>

            {selectedDoc && (
              <Badge variant="secondary" className="font-mono text-[10px] hidden sm:inline-flex">
                {selectedDoc.chunk_count} chunks
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#86868B]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">pgvector HNSW</span>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {!selectedDoc ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto"
            >
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center mb-3">
                <Database className="w-6 h-6 text-[#0071E3]" />
              </div>
              <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-base">
                Select a Knowledge Source
              </h3>
              <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] mt-1.5 mb-5 leading-relaxed">
                Choose an indexed document from the selector above to ask questions.
              </p>
              <MotionButton
                onClick={onSwitchToDashboard}
                variant="default"
                size="pill"
                className="text-xs"
              >
                Go to Knowledge Base
              </MotionButton>
            </motion.div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-full flex flex-col items-center justify-center text-center p-8 max-w-xl mx-auto"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center mb-3 shadow-xs">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {selectedDoc.original_name}
              </h2>
              <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] mt-1.5 mb-6 leading-relaxed max-w-md">
                Ask questions about content, key findings, or requirements. Answers are strictly grounded with source citations.
              </p>

              {/* Suggested Questions */}
              <div className="w-full space-y-2 text-left">
                <div className="text-[11px] font-mono text-[#86868B] mb-1">
                  Suggested Queries
                </div>
                {[
                  'Summarize the key findings in this document.',
                  'What are the main requirements described in this report?',
                  'List the primary conclusions and actionable takeaways.',
                  'Which sections support this answer?',
                ].map((s, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ x: 3, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setInputQuery(s)}
                    className="w-full text-left p-3.5 rounded-xl border border-[#D2D2D7]/50 dark:border-white/10 bg-white dark:bg-[#161617] hover:border-[#1D1D1F]/30 dark:hover:border-white/20 text-xs text-[#1D1D1F] dark:text-[#F5F5F7] transition-all flex items-center justify-between group shadow-xs cursor-pointer"
                  >
                    <span>{s}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#0071E3] transition-transform group-hover:translate-x-0.5" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onSelectCitation={(c) => setSelectedCitation(c)}
                />
              ))}

              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-[#161617] border border-[#D2D2D7]/50 dark:border-white/10 max-w-sm shadow-xs"
                >
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0071E3] opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0071E3]" />
                  </div>
                  <div className="text-xs font-medium text-[#6E6E73] dark:text-[#A1A1A6]">
                    Retrieving pgvector chunks &amp; verifying citations...
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Query Input Bar */}
        <div className="p-4 bg-white dark:bg-[#161617] border-t border-[#D2D2D7]/50 dark:border-white/10">
          <form onSubmit={handleSend} className="relative flex items-center gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              placeholder={
                selectedDoc
                  ? `Ask a question about ${selectedDoc.original_name}...`
                  : 'Select a knowledge source first...'
              }
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={!selectedDoc || loading}
              className="flex-1 px-4 py-3 rounded-full border border-[#D2D2D7]/60 dark:border-white/15 bg-[#F5F5F7] dark:bg-[#000000] text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#0071E3] transition-colors disabled:opacity-50 shadow-xs"
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!selectedDoc || !inputQuery.trim() || loading}
              className="p-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium transition-opacity disabled:opacity-40 cursor-pointer shadow-xs"
              title="Submit Query"
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </form>
        </div>
      </div>

      {/* Right Drawer: Citation Inspector */}
      <div className="w-full md:w-80 lg:w-96 bg-[#F5F5F7] dark:bg-[#161617] border-l border-[#D2D2D7]/50 dark:border-white/10 flex flex-col shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-[#D2D2D7]/50 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="w-3.5 h-3.5 text-[#0071E3]" />
            <h4 className="font-semibold text-xs tracking-wider uppercase text-[#1D1D1F] dark:text-[#F5F5F7]">
              Citation Inspector
            </h4>
          </div>
          {selectedCitation && (
            <Badge variant="glow" className="font-mono text-[10px]">
              {(selectedCitation.similarity * 100).toFixed(1)}% match
            </Badge>
          )}
        </div>

        <div className="p-4 flex-1 space-y-4">
          <AnimatePresence mode="wait">
            {selectedCitation ? (
              <motion.div
                key={selectedCitation.id || selectedCitation.chunk_index}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                {/* Citation metadata card */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#1D1D1F] border border-[#D2D2D7]/50 dark:border-white/10 space-y-2 text-xs shadow-xs">
                  <div className="flex items-center gap-2 font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                    <FileText className="w-3.5 h-3.5 text-[#0071E3]" />
                    <span className="truncate">{selectedCitation.file_path || 'Source Document'}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#86868B] pt-2 border-t border-[#D2D2D7]/40 dark:border-white/10">
                    {selectedCitation.page_number && (
                      <div>Page: {selectedCitation.page_number}</div>
                    )}
                    {selectedCitation.url && (
                      <div className="truncate" title={selectedCitation.url}>Web Source</div>
                    )}
                    {selectedCitation.line_start && !selectedCitation.page_number && (
                      <div>Lines: {selectedCitation.line_start}-{selectedCitation.line_end}</div>
                    )}
                    <div>Chunk #{selectedCitation.chunk_index}</div>
                  </div>
                </div>

                {/* Verbatim snippet */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-[#86868B] mb-1.5 font-medium">
                    Source Excerpt
                  </label>
                  <pre className="p-3.5 rounded-xl bg-white dark:bg-[#000000] border border-[#D2D2D7]/50 dark:border-white/10 font-mono text-xs leading-relaxed text-[#1D1D1F] dark:text-[#F5F5F7] whitespace-pre-wrap selection:bg-[#0071E3]/20 shadow-xs overflow-x-auto">
                    {selectedCitation.content}
                  </pre>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-[#86868B] text-xs"
              >
                <Quote className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#86868B]" />
                <p className="font-medium">No citation selected</p>
                <p className="text-[11px] mt-1 text-[#86868B] max-w-xs mx-auto leading-relaxed">
                  Click any citation tag in an answer to inspect its exact source excerpt and page references.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
