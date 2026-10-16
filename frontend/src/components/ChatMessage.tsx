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
  Copy, 
  Check, 
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
      return <FileCode className="w-3.5 h-3.5 text-[#0071E3]" />;
    }
    if (citation.page_number) {
      return <FileText className="w-3.5 h-3.5 text-[#0071E3]" />;
    }
    if (citation.url?.includes('youtube') || citation.url?.includes('youtu.be')) {
      return <Video className="w-3.5 h-3.5 text-[#0071E3]" />;
    }
    return <Globe className="w-3.5 h-3.5 text-[#0071E3]" />;
  };

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-3xl w-full ${isUser ? 'flex justify-end' : ''}`}>
        {isUser ? (
          // User Message Bubble (Apple Classic Blue, Crisp Typography)
          <div className="bg-[#0071E3] text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-xl shadow-sm selection:bg-white selection:text-[#0071E3]">
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{message.content}</p>
            <div className="text-[10px] text-white/70 mt-1 text-right font-mono">
              {message.timestamp}
            </div>
          </div>
        ) : (
          // Assistant Message Card (Apple Surface Card, Hairline Border)
          <div className="w-full bg-white dark:bg-[#161617] border border-[#D2D2D7]/60 dark:border-white/10 rounded-xl p-5 sm:p-6 shadow-sm transition-all">
            {/* Header: Identity & Latency */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#D2D2D7]/40 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <img
                  src="/logo-icon.png"
                  alt="DocSupport Logo"
                  className="w-6 h-6 rounded-md object-contain shadow-xs border border-black/10 dark:border-white/15"
                />
                <span className="font-semibold text-xs tracking-tight text-[#1D1D1F] dark:text-[#F5F5F7]">
                  DocSupport Grounded RAG
                </span>
                {message.latencyMs && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-[#86868B] flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {message.latencyMs}ms
                  </span>
                )}
              </div>
              <button
                onClick={handleCopy}
                className="text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] transition-colors p-1 rounded-md"
                title="Copy response markdown"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#34C759]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Abstention Warning Banner (Dual Guardrail trigger) */}
            {message.abstained && (
              <div className="mb-4 p-3.5 rounded-xl bg-[#FF9500]/10 border border-[#FF9500]/25 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-[#FF9500] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-semibold text-[#FF9500]">
                    Dual Guardrail: Model Abstained
                  </div>
                  <div className="text-[#6E6E73] dark:text-[#A1A1A6] mt-0.5 leading-relaxed">
                    {message.abstentionReason || 'The answer is absent or ambiguous in the provided source chunks. The engine strictly refrained from hallucinating.'}
                  </div>
                </div>
              </div>
            )}

            {/* Markdown Content with Editorial Line Height */}
            <div className="prose dark:prose-invert max-w-none text-[14px] leading-relaxed text-[#1D1D1F] dark:text-[#F5F5F7]">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>

            {/* Citations & Evidence Drawer */}
            {message.citations && message.citations.length > 0 && (
              <div className="mt-6 pt-4 border-t border-[#D2D2D7]/40 dark:border-white/10">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#86868B] flex items-center gap-1.5 font-medium">
                    <Quote className="w-3 h-3 text-[#0071E3]" />
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
                        className="rounded-lg border border-[#D2D2D7]/60 dark:border-white/10 bg-[#F5F5F7] dark:bg-[#1D1D1F] overflow-hidden transition-all text-xs"
                      >
                        {/* Header bar */}
                        <div
                          onClick={() => {
                            toggleCitation(c.id);
                            if (onSelectCitation) onSelectCitation(c);
                          }}
                          className="flex items-center justify-between px-3.5 py-2.5 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center gap-2 overflow-hidden pr-2">
                            <span className="w-4 h-4 rounded bg-[#0071E3]/15 text-[#0071E3] font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                              {citationNum}
                            </span>
                            <div className="flex items-center gap-1.5 truncate text-[#1D1D1F] dark:text-[#F5F5F7] font-medium">
                              {getSourceIcon(c)}
                              <span className="truncate">{c.file_path || c.url || 'Source Document'}</span>
                            </div>
                            {c.line_start && (
                              <span className="text-[10px] text-[#86868B] font-mono shrink-0">
                                L{c.line_start}-{c.line_end}
                              </span>
                            )}
                            {c.page_number && (
                              <span className="text-[10px] text-[#86868B] font-mono shrink-0">
                                p.{c.page_number}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10 text-[#6E6E73] dark:text-[#A1A1A6]">
                              {(c.similarity * 100).toFixed(1)}% match
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#86868B]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#86868B]" />
                            )}
                          </div>
                        </div>

                        {/* Verbatim quote body */}
                        {isExpanded && (
                          <div className="px-4 py-3 bg-white dark:bg-[#000000] border-t border-[#D2D2D7]/40 dark:border-white/10 font-mono text-[11px] leading-relaxed text-[#1D1D1F] dark:text-[#F5F5F7] whitespace-pre-wrap selection:bg-[#0071E3]/20">
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
