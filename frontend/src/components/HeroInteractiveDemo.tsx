import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, FileText, Copy, Check, ShieldCheck, Sparkles } from "lucide-react";
import { AnimatedNumber } from "./ui/animated-counter";

interface DemoScenario {
  id: string;
  tabLabel: string;
  documentName: string;
  query: string;
  answer: string;
  citationSource: string;
  citationLocation: string;
  citationExcerpt: string;
  matchScore: number;
  latencyMs: number;
}

const SCENARIOS: DemoScenario[] = [
  {
    id: "spec",
    tabLabel: "Architecture Spec (PDF)",
    documentName: "pdf:system_architecture_spec_v2.pdf (Page 14)",
    query: "What are the primary latency and persistence requirements specified in the SLA?",
    answer: "The architecture mandates a 99th percentile query latency below 250 milliseconds, with synchronous multi-region replication ensuring a Recovery Point Objective (RPO) of zero for all state transitions [1].",
    citationSource: "system_architecture_spec_v2.pdf",
    citationLocation: "Page 14 • Section 4.2: High Availability & SLOs",
    citationExcerpt: `4.2 Service Level Objectives (SLOs):
The primary distributed data store must maintain synchronous transactional writes across availability zones. System-wide 99th percentile query latency must remain below 250ms under peak load. In the event of primary node degradation, failover orchestrators must preserve RPO=0.`,
    matchScore: 95.4,
    latencyMs: 142,
  },
  {
    id: "financial",
    tabLabel: "Financial Report (PDF)",
    documentName: "pdf:annual_earnings_analysis_2025.pdf (Page 8)",
    query: "Summarize the key revenue growth drivers and operating margin expansion.",
    answer: "Consolidated annual revenue expanded 34% year-over-year driven primarily by enterprise platform subscriptions, while operating margin widened to 24.5% (up 630 bps) due to automation of document workflows [1].",
    citationSource: "annual_earnings_analysis_2025.pdf",
    citationLocation: "Page 8 • Table 2.1: Financial Highlights",
    citationExcerpt: `Table 2.1 — Consolidated Financial Highlights:
Consolidated annual revenue reached $142.8M, reflecting a 34% increase YoY. Operating margin widened to 24.5% (up 630 bps), driven by increased gross retention and efficiency gains across autonomous document processing workflows.`,
    matchScore: 97.1,
    latencyMs: 118,
  },
  {
    id: "clinical",
    tabLabel: "Research Paper (PDF)",
    documentName: "pdf:clinical_trial_summary_phase3.pdf (Page 22)",
    query: "What was the observed efficacy rate in the active intervention cohort compared to control?",
    answer: "The cohort achieved an 82.4% primary endpoint response rate compared to 31.0% in the placebo control group (p < 0.001), with high tolerability observed across all demographic cohorts [1].",
    citationSource: "clinical_trial_summary_phase3.pdf",
    citationLocation: "Page 22 • Section 5: Primary Endpoints",
    citationExcerpt: `Section 5 — Primary Outcome Measures:
Primary outcome measures demonstrated an 82.4% response rate in the active intervention arm (n=412) versus 31.0% in the control arm (n=204) at week 24 (p < 0.001). Adverse incident profiling indicated high tolerability across all demographic strata.`,
    matchScore: 94.6,
    latencyMs: 135,
  },
];

export function HeroInteractiveDemo() {
  const [selectedId, setSelectedId] = React.useState<string>("spec");
  const [copied, setCopied] = React.useState(false);

  const scenario = SCENARIOS.find((s) => s.id === selectedId) || SCENARIOS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(scenario.citationExcerpt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-12 md:mt-18 max-w-5xl mx-auto rounded-2xl md:rounded-3xl border border-[#D2D2D7]/70 dark:border-white/10 bg-[#FFFFFF] dark:bg-[#161617] shadow-elevated dark:shadow-dark-elevated overflow-hidden text-left transition-all">
      {/* Top Window Titlebar & Interactive Scenario Selector */}
      <div className="px-5 py-3.5 border-b border-[#D2D2D7]/50 dark:border-white/10 bg-[#F5F5F7] dark:bg-[#1D1D1F] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F56]/80 hover:opacity-100 transition-opacity"></div>
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/80 hover:opacity-100 transition-opacity"></div>
          <div className="w-3 h-3 rounded-full bg-[#27C93F]/80 hover:opacity-100 transition-opacity"></div>
          <span className="ml-2 text-xs font-mono text-[#86868B] dark:text-[#A1A1A6] truncate">
            {scenario.documentName}
          </span>
        </div>

        {/* Live Scenario Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {SCENARIOS.map((s) => {
            const isSelected = s.id === selectedId;
            return (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`relative px-3 py-1 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? "text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold"
                    : "text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="heroTabIndicator"
                    transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    className="absolute inset-0 bg-white dark:bg-[#2C2C2E] rounded-lg shadow-xs -z-10 border border-black/5 dark:border-white/10"
                  />
                )}
                <span>{s.tabLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Body (Split View) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
        {/* Left Column: Chat Conversation Stream */}
        <div className="lg:col-span-7 p-6 border-b lg:border-b-0 lg:border-r border-[#D2D2D7]/50 dark:border-white/10 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* User Query Bubble */}
              <div className="flex justify-end">
                <motion.div
                  initial={{ scale: 0.96 }}
                  animate={{ scale: 1 }}
                  className="max-w-md bg-[#0071E3] text-white px-4 py-2.5 rounded-2xl rounded-tr-sm text-xs md:text-sm leading-relaxed shadow-sm"
                >
                  {scenario.query}
                </motion.div>
              </div>

              {/* Assistant Grounded Answer */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 rounded-xl bg-[#F5F5F7] dark:bg-[#1D1D1F] border border-[#D2D2D7]/40 dark:border-white/5 space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between text-[11px] font-mono text-[#86868B]">
                  <span className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0071E3]" />
                    Grounded Response
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Groq llama-3.3-70b</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm leading-relaxed text-[#1D1D1F] dark:text-[#F5F5F7]">
                  {scenario.answer.replace("[1]", "")}
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-[#0071E3]/10 text-[#0071E3] font-mono text-xs font-semibold cursor-pointer hover:bg-[#0071E3]/20 transition-colors">
                    [1]
                  </span>
                </p>
              </motion.div>
            </motion.div>
          </AnimatePresence>

          {/* Query Input simulation footer */}
          <div className="mt-6 pt-4 border-t border-[#D2D2D7]/40 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#86868B]">
            <span className="font-mono flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Input Guard: Sanitized (0 injections)
            </span>
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <Clock className="w-3 h-3 text-[#0071E3]" />
              <AnimatedNumber value={scenario.latencyMs} suffix="ms retrieval" />
              <span>&bull; pgvector 768d</span>
            </div>
          </div>
        </div>

        {/* Right Column: Verbatim Evidence Inspector */}
        <div className="lg:col-span-5 p-6 bg-[#FBFBFD] dark:bg-[#111112] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#D2D2D7]/50 dark:border-white/10 mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73] dark:text-[#86868B] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#0071E3]" />
                  Citation [1] Source Evidence
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] font-semibold flex items-center gap-1">
                  <AnimatedNumber value={scenario.matchScore} decimals={1} suffix="% Cosine Match" />
                </span>
              </div>

              {/* Progress bar match visual */}
              <div className="w-full bg-black/5 dark:bg-white/10 h-1 rounded-full mb-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scenario.matchScore}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                />
              </div>

              <div className="space-y-1 text-xs font-mono text-[#86868B] mb-3">
                <div className="text-[#1D1D1F] dark:text-[#F5F5F7] font-semibold truncate">
                  {scenario.citationSource}
                </div>
                <div>{scenario.citationLocation}</div>
              </div>

              {/* Verbatim Document Excerpt with Copy Button */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/80 dark:bg-black/50 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] backdrop-blur-sm transition-all opacity-80 group-hover:opacity-100 shadow-xs cursor-pointer"
                  title="Copy verbatim document excerpt"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <pre className="p-3.5 rounded-xl bg-[#F5F5F7] dark:bg-[#1A1A1C] border border-[#D2D2D7]/40 dark:border-white/10 text-[11px] font-mono text-[#1D1D1F] dark:text-[#F5F5F7] overflow-x-auto leading-relaxed whitespace-pre-wrap">
                  {scenario.citationExcerpt}
                </pre>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="text-[11px] text-[#86868B] pt-4 border-t border-[#D2D2D7]/40 dark:border-white/10 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Verified HNSW Cosine Index
            </span>
            <span className="font-mono text-[#1D1D1F] dark:text-[#F5F5F7]">Vector(768)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
