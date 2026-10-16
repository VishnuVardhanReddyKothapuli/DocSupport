import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Citation } from '../api/queryResponse';
import { 
  ShieldAlert, 
  FileCode, 
  FileText, 
  Globe, 
  Video, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  Clock, 
  Quote
} from 'lucide-react';

export interface Message {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citations?: Citation[];
  abstained?: boolean;
  abstentionReason?: string | null;
  latencyMs?: number;
}

interface ChatMessageProps {
  message: Message;
  onSelectCitation?: (citation: Citation) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, onSelectCitation }) => {
  const isUser = message.sender === 'user';
  const [copied, setCopied] = useState(false);
  const [expandedCitationId, setExpandedCitationId] = useState<string | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleCitation = (id: string) => {
    setExpandedCitationId(prev => (prev === id ? null : id));
  };

  const getSourceIcon = (citation: Citation) => {
    if (citation.language || citation.file_path?.includes('.')) {
      return <FileCode className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (citation.page_number) {
      return <FileText className="w-3.5 h-3.5 text-blue-400" />;
    }
    if (citation.url?.includes('youtube') || citation.url?.includes('youtu.be')) {
      return <Video className="w-3.5 h-3.5 text-rose-400" />;
    }
    return <Globe className="w-3.5 h-3.5 text-indigo-400" />;
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-3xl w-full ${isUser ? 'flex justify-end' : ''}`}>
        {isUser ? (
          // User Message Bubble (Electric Indigo Gradient)
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 text-white px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-glow-sm max-w-xl">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
            <div className="text-[11px] text-indigo-200 mt-1.5 text-right font-mono">
              {message.timestamp}
            </div>
          </div>
        ) : (
          // Assistant Message Card (Octet / Slate Card)
          <div className="w-full bg-white dark:bg-cyber-card border border-slate-200 dark:border-cyber-border rounded-2xl rounded-tl-sm p-6 shadow-sm dark:shadow-none transition-all">
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-cyber-border/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                  DocSupport RAG
                </span>
                {message.latencyMs && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {message.latencyMs}ms
                  </span>
                )}
              </div>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-indigo-500 transition-colors p-1 rounded"
                title="Copy response"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Abstention Warning Banner (Dual Guardrail trigger) */}
            {message.abstained && (
              <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-amber-600 dark:text-amber-400">
                    Dual Guardrail: Model Abstained
                  </div>
                  <div className="text-amber-700/80 dark:text-amber-300/80 mt-0.5">
                    {message.abstentionReason || 'The answer is missing or ambiguous in the indexed source chunks. The system refrained from hallucinating.'}
                  </div>
                </div>
              </div>
            )}

            {/* Markdown content */}
            <div className="prose dark:prose-invert max-w-none text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {/* Citations & Evidence Drawer */}
            {message.citations && message.citations.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-cyber-border">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                    <Quote className="w-3 h-3 text-indigo-500" />
                    Verbatim Grounded Citations ({message.citations.length})
                  </span>
                </div>

                <div className="space-y-2">
                  {message.citations.map((c, idx) => {
                    const isExpanded = expandedCitationId === c.id;
                    const citationNum = idx + 1;
                    return (
                      <div
                        key={c.id || idx}
                        className="rounded-xl border border-slate-200 dark:border-cyber-border bg-slate-50 dark:bg-slate-900/60 overflow-hidden transition-all text-xs"
                      >
                        {/* Header bar */}
                        <div
                          onClick={() => {
                            toggleCitation(c.id);
                            if (onSelectCitation) onSelectCitation(c);
                          }}
                          className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-colors"
                        >
                          <div className="flex items-center gap-2 overflow-hidden pr-2">
                            <span className="w-5 h-5 rounded bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                              [{citationNum}]
                            </span>
                            <div className="flex items-center gap-1.5 truncate text-slate-700 dark:text-slate-300 font-medium">
                              {getSourceIcon(c)}
                              <span className="truncate">{c.file_path || c.url || 'Source Document'}</span>
                            </div>
                            {c.line_start && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                                L{c.line_start}-{c.line_end}
                              </span>
                            )}
                            {c.page_number && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0">
                                p.{c.page_number}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                              {(c.similarity * 100).toFixed(1)}% match
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                            )}
                          </div>
                        </div>

                        {/* Verbatim quote body */}
                        {isExpanded && (
                          <div className="px-4 py-3 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-cyber-border font-mono text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 whitespace-pre-wrap selection:bg-indigo-500/30">
                            {c.content}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
