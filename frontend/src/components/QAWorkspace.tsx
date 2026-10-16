import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Database, 
  FileText, 
  ChevronRight, 
  Loader2,
  Quote
} from 'lucide-react';
import { DocumentItem } from '../api/sourceIngestion';
import { queryKnowledge, Citation } from '../api/queryResponse';
import { ChatMessage, Message } from './ChatMessage';

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
              className="px-3 py-1.5 rounded-lg text-xs font-medium border border-[#D2D2D7]/60 dark:border-white/15 bg-white dark:bg-[#1D1D1F] text-[#1D1D1F] dark:text-[#F5F5F7] focus:outline-none focus:border-[#0071E3] max-w-xs truncate shadow-sm"
            >
              {completedDocs.length === 0 && <option value="">No ready sources</option>}
              {completedDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.original_name}
                </option>
              ))}
            </select>

            {selectedDoc && (
              <span className="text-[11px] text-[#86868B] hidden sm:inline-block">
                {selectedDoc.chunk_count} chunks
              </span>
            )}
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {!selectedDoc ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto">
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 text-[#1D1D1F] dark:text-[#F5F5F7] flex items-center justify-center mb-3">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] text-base">
                Select a Knowledge Source
              </h3>
              <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] mt-1.5 mb-5 leading-relaxed">
                Choose an indexed document from the selector above to ask questions.
              </p>
              <button
                onClick={onSwitchToDashboard}
                className="px-4 py-2 rounded-full bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] text-xs font-medium hover:opacity-90 transition-opacity"
              >
                Go to Knowledge Base
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                {selectedDoc.original_name}
              </h2>
              <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] mt-1.5 mb-6 leading-relaxed max-w-md">
                Ask questions about content, architecture, or requirements. Answers are verified and cited from the source.
              </p>

              {/* Suggested Questions */}
              <div className="w-full space-y-2 text-left">
                <div className="text-[11px] font-mono text-[#86868B] mb-1">
                  Suggested Queries
                </div>
                {[
                  selectedDoc.source_type === 'GIT'
                    ? 'Explain the repository structure and entry points.'
                    : 'What are the main key points in this document?',
                  selectedDoc.source_type === 'GIT'
                    ? 'How is authentication or database configuration handled?'
                    : 'List the primary requirements and constraints.',
                  'Provide a concise summary of this source.',
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputQuery(s)}
                    className="w-full text-left p-3.5 rounded-xl border border-[#D2D2D7]/50 dark:border-white/10 bg-white dark:bg-[#161617] hover:border-[#1D1D1F]/30 dark:hover:border-white/20 text-xs text-[#1D1D1F] dark:text-[#F5F5F7] transition-all flex items-center justify-between group shadow-sm"
                  >
                    <span>{s}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#86868B] group-hover:text-[#0071E3] transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </div>
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
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white dark:bg-[#161617] border border-[#D2D2D7]/50 dark:border-white/10 max-w-xs shadow-sm">
                  <Loader2 className="w-3.5 h-3.5 text-[#0071E3] animate-spin" />
                  <span className="text-xs font-medium text-[#6E6E73] dark:text-[#A1A1A6]">
                    Retrieving and generating answer...
                  </span>
                </div>
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
              className="flex-1 px-4 py-3 rounded-full border border-[#D2D2D7]/60 dark:border-white/15 bg-[#F5F5F7] dark:bg-[#000000] text-sm text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:border-[#0071E3] transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!selectedDoc || !inputQuery.trim() || loading}
              className="px-4 py-3 rounded-full bg-[#1D1D1F] dark:bg-[#F5F5F7] text-white dark:text-[#1D1D1F] text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
              title="Submit Query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
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
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">
              {(selectedCitation.similarity * 100).toFixed(1)}% match
            </span>
          )}
        </div>

        <div className="p-4 flex-1 space-y-4">
          {selectedCitation ? (
            <div className="space-y-3">
              {/* Citation metadata card */}
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#1D1D1F] border border-[#D2D2D7]/50 dark:border-white/10 space-y-2 text-xs shadow-sm">
                <div className="flex items-center gap-2 font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                  <FileText className="w-3.5 h-3.5 text-[#0071E3]" />
                  <span className="truncate">{selectedCitation.file_path || 'Source Document'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-[#86868B] pt-2 border-t border-[#D2D2D7]/40 dark:border-white/10">
                  {selectedCitation.line_start && (
                    <div>Lines: {selectedCitation.line_start}-{selectedCitation.line_end}</div>
                  )}
                  {selectedCitation.page_number && (
                    <div>Page: {selectedCitation.page_number}</div>
                  )}
                  {selectedCitation.language && (
                    <div>Lang: {selectedCitation.language}</div>
                  )}
                  <div>Chunk #{selectedCitation.chunk_index}</div>
                </div>
              </div>

              {/* Verbatim snippet */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-[#86868B] mb-1.5 font-medium">
                  Source Excerpt
                </label>
                <div className="p-3.5 rounded-xl bg-white dark:bg-[#000000] border border-[#D2D2D7]/50 dark:border-white/10 font-mono text-xs leading-relaxed text-[#1D1D1F] dark:text-[#F5F5F7] whitespace-pre-wrap selection:bg-[#0071E3]/20 shadow-sm">
                  {selectedCitation.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-[#86868B] text-xs">
              <Quote className="w-8 h-8 mx-auto mb-2 opacity-30 text-[#86868B]" />
              <p className="font-medium">No citation selected</p>
              <p className="text-[11px] mt-1 text-[#86868B] max-w-xs mx-auto leading-relaxed">
                Click any citation tag in an answer to inspect its exact source excerpt and line numbers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
