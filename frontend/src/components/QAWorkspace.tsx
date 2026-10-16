import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Database, 
  Clock, 
  ShieldCheck, 
  FileCode, 
  FileText, 
  Globe, 
  Video, 
  AlignLeft, 
  GitBranch, 
  ChevronRight, 
  Activity, 
  Sliders, 
  BookOpen, 
  CheckCircle2, 
  Cpu, 
  AlertCircle,
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

  const getSourceIcon = (type?: string) => {
    switch (type) {
      case 'GIT':
        return <GitBranch className="w-4 h-4 text-emerald-400" />;
      case 'PDF':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'WEBSITE':
        return <Globe className="w-4 h-4 text-indigo-400" />;
      case 'YOUTUBE':
        return <Video className="w-4 h-4 text-rose-400" />;
      default:
        return <AlignLeft className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
      {/* Central Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#F8FAFC] dark:bg-[#090D16] border-r border-slate-200 dark:border-cyber-border overflow-hidden">
        {/* Workspace Subheader */}
        <div className="px-6 py-3.5 border-b border-slate-200 dark:border-cyber-border bg-white dark:bg-cyber-card flex items-center justify-between gap-4">
          {/* Target source selector */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              Active Source:
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
              className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-200 dark:border-cyber-border bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500 max-w-xs truncate"
            >
              {completedDocs.length === 0 && <option value="">No ready sources</option>}
              {completedDocs.map((d) => (
                <option key={d.id} value={d.id}>
                  [{d.source_type}] {d.original_name} ({d.chunk_count} chunks)
                </option>
              ))}
            </select>

            {selectedDoc && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hidden sm:inline-block">
                {selectedDoc.chunk_count} pgvector chunks
              </span>
            )}
          </div>

          {/* LangGraph & Langfuse badges */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Activity className="w-3 h-3 text-indigo-500" />
              LangGraph StateGraph
            </div>
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Langfuse Monitored
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!selectedDoc ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-base">Select a Knowledge Source</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-4">
                Choose a vectorized codebase repository, PDF, or website from the top selector or your knowledge base.
              </p>
              <button
                onClick={onSwitchToDashboard}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-glow-sm"
              >
                Go to Knowledge Base
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-lg mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center mb-4 shadow-glow-sm">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Grounded Q&A on {selectedDoc.original_name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6 leading-relaxed">
                Ask any question about architecture, code functions, requirements, or data. Every claim is strictly grounded with clickable verbatim citations.
              </p>

              {/* Suggested Questions */}
              <div className="w-full space-y-2 text-left">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Suggested Queries
                </div>
                {[
                  selectedDoc.source_type === 'GIT'
                    ? 'Explain the main architecture and directory structure of this repository.'
                    : 'What are the main key points and takeaways in this document?',
                  selectedDoc.source_type === 'GIT'
                    ? 'How is authentication or database connectivity handled in this codebase?'
                    : 'List all specific requirements and constraints mentioned in the text.',
                  'Provide a technical summary with direct source citations.',
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputQuery(s);
                    }}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-cyber-border bg-white dark:bg-cyber-card hover:border-indigo-500 text-xs text-slate-700 dark:text-slate-300 transition-all flex items-center justify-between group"
                  >
                    <span>{s}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:translate-x-0.5" />
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
                <div className="flex items-center gap-2.5 p-4 rounded-xl bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border max-w-xs animate-pulse">
                  <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                    Running LangGraph RAG Agent...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Query Input Box */}
        <div className="p-4 bg-white dark:bg-cyber-card border-t border-slate-200 dark:border-cyber-border">
          <form onSubmit={handleSend} className="relative flex items-center gap-2">
            <input
              type="text"
              placeholder={
                selectedDoc
                  ? `Ask a grounded question about ${selectedDoc.original_name}...`
                  : 'Select a document first...'
              }
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={!selectedDoc || loading}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-cyber-border bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!selectedDoc || !inputQuery.trim() || loading}
              className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-glow-sm transition-all disabled:opacity-40 disabled:hover:bg-indigo-600"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
            <span className="flex items-center gap-1 font-mono">
              <ShieldCheck className="w-3 h-3 text-emerald-500" />
              Dual Guardrails Active: Hallucination strictly prohibited
            </span>
            <span className="font-mono">Groq llama-3.3-70b-versatile</span>
          </div>
        </div>
      </div>

      {/* Right Drawer: Citation & Grounding Inspector */}
      <div className="w-full md:w-80 lg:w-96 bg-white dark:bg-cyber-card border-l border-slate-200 dark:border-cyber-border flex flex-col shrink-0 overflow-y-auto">
        <div className="p-4 border-b border-slate-200 dark:border-cyber-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Quote className="w-4 h-4 text-indigo-500" />
            <h4 className="font-semibold text-xs tracking-wider uppercase text-slate-800 dark:text-slate-200">
              Evidence Inspector
            </h4>
          </div>
          {selectedCitation && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              {(selectedCitation.similarity * 100).toFixed(1)}% match
            </span>
          )}
        </div>

        <div className="p-4 flex-1 space-y-4">
          {selectedCitation ? (
            <div className="space-y-3">
              {/* Citation metadata card */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-cyber-border space-y-2 text-xs">
                <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
                  {getSourceIcon(selectedDoc?.source_type)}
                  <span className="truncate">{selectedCitation.file_path || 'Source Document'}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/50 dark:border-cyber-border">
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
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Verbatim Retrieved Chunk
                </label>
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-cyber-border font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap selection:bg-indigo-500/30">
                  {selectedCitation.content}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Quote className="w-8 h-8 mx-auto mb-2 opacity-30 text-indigo-500" />
              <p>No citation selected.</p>
              <p className="text-[11px] mt-1 text-slate-500">
                Click any citation tag [1], [2] in an answer to inspect its verbatim source text here.
              </p>
            </div>
          )}

          {/* LangGraph Pipeline Visualizer */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-cyber-border space-y-2.5">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              LangGraph Agent Pipeline
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              {[
                { name: '1. Input Security Guard', desc: 'Sanitizes injection attacks' },
                { name: '2. pgvector Cosine Search', desc: 'Sub-second 768d vector retrieval' },
                { name: '3. Evidence Sufficiency Grade', desc: 'Filters weak semantic matches' },
                { name: '4. Groq LLM Generation', desc: 'llama-3.3-70b-versatile (temp 0.1)' },
                { name: '5. Output Hallucination Guard', desc: 'Verbatim citations or abstain' },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-cyber-border"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                      {step.name}
                    </div>
                    <div className="text-[10px] text-slate-400">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
