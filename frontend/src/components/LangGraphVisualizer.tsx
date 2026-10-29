import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Search, Scale, Sparkles, ShieldAlert, CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "./ui/badge";

interface NodeData {
  id: string;
  step: string;
  title: string;
  shortDesc: string;
  details: string;
  metric: string;
  icon: React.ElementType;
}

const NODES: NodeData[] = [
  {
    id: "input-guard",
    step: "01",
    title: "Input Guard",
    shortDesc: "Sanitizes queries and intercepts jailbreaks or prompt injections.",
    details: "Regex & semantic safety classifiers scan incoming prompts. Zero-day prompt injections and system overrides are dropped before reaching vector retrieval.",
    metric: "0 injections passed",
    icon: ShieldAlert,
  },
  {
    id: "pgvector",
    step: "02",
    title: "pgvector Search",
    shortDesc: "Sub-second cosine similarity retrieval across 768d vectors.",
    details: "HNSW index on PostgreSQL 16 executes sub-second vector cosine distance matching. Top-k semantic chunks are retrieved with document and page metadata.",
    metric: "< 150ms HNSW index",
    icon: Search,
  },
  {
    id: "evidence-grade",
    step: "03",
    title: "Evidence Grade",
    shortDesc: "Evaluates if retrieved chunks meet minimum relevance thresholds.",
    details: "Calculates relevance score. If cosine similarity falls below threshold, the state machine branches to the abstention node instead of guessing.",
    metric: "Threshold > 0.78",
    icon: Scale,
  },
  {
    id: "groq-llm",
    step: "04",
    title: "Groq & Gemini Dual Engine",
    shortDesc: "Strictly grounded inference with automatic mutual failover.",
    details: "Ultra-fast Groq LPUs paired with Google Gemini in mutual failover mode. Answers solely within retrieved evidence bounds with bracketed inline citations.",
    metric: "Temp 0.1 • Mutual Failover",
    icon: Sparkles,
  },
  {
    id: "output-guard",
    step: "05",
    title: "Output Guard",
    shortDesc: "Verifies verbatim citations or enforces explicit abstention.",
    details: "Final guardrail validates that every citation bracket corresponds to verified source excerpts. If evidence is missing, returns verified abstention.",
    metric: "100% Grounded citations",
    icon: ShieldCheck,
  },
];

export function LangGraphVisualizer() {
  const [activeNodeId, setActiveNodeId] = React.useState<string>("pgvector");
  const [autoPacketIndex, setAutoPacketIndex] = React.useState<number>(0);

  // Auto-pulse packet through nodes every 2.5s
  React.useEffect(() => {
    const timer = setInterval(() => {
      setAutoPacketIndex((prev) => (prev + 1) % NODES.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const activeNode = NODES.find((n) => n.id === activeNodeId) || NODES[1];

  return (
    <div className="w-full rounded-2xl md:rounded-3xl border border-[#D2D2D7]/60 dark:border-white/10 bg-white/60 dark:bg-[#161617]/70 backdrop-blur-xl p-6 md:p-8 shadow-elevated overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[#D2D2D7]/40 dark:border-white/10 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0071E3] animate-pulse" />
            <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">
              Interactive LangGraph State Machine
            </h3>
          </div>
          <p className="text-xs text-[#6E6E73] dark:text-[#A1A1A6] mt-1">
            Real-time execution pipeline from query ingestion to verified grounded synthesis.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="glow" dot pulse>
            Live State Machine
          </Badge>
          <span className="text-[11px] font-mono text-[#86868B]">LangGraph v0.2</span>
        </div>
      </div>

      {/* Horizontal Interactive Pipeline Nodes */}
      <div className="relative py-8">
        {/* Background track line */}
        <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-0.5 bg-gradient-to-r from-blue-500/20 via-sky-400/20 to-emerald-500/20 z-0 hidden lg:block" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10">
          {NODES.map((node, index) => {
            const Icon = node.icon;
            const isSelected = activeNodeId === node.id;
            const isPulseActive = autoPacketIndex === index;

            return (
              <motion.button
                key={node.id}
                type="button"
                onClick={() => setActiveNodeId(node.id)}
                whileHover={{ y: -3, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
                  isSelected
                    ? "bg-white dark:bg-[#1E1E20] border-[#0071E3] shadow-[0_4px_20px_rgba(0,113,227,0.18)] dark:shadow-[0_4px_24px_rgba(0,113,227,0.3)] ring-1 ring-[#0071E3]"
                    : "bg-white/80 dark:bg-[#161617] border-[#D2D2D7]/60 dark:border-white/10 hover:border-[#86868B]"
                }`}
              >
                {/* Active packet glowing indicator */}
                {isPulseActive && (
                  <motion.div
                    layoutId="activePacketGlow"
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-[#0071E3] shadow-[0_0_10px_#0071E3] flex items-center justify-center"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  </motion.div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-semibold text-[#86868B]">
                      {node.step}
                    </span>
                    <div
                      className={`p-1.5 rounded-lg ${
                        isSelected
                          ? "bg-[#0071E3] text-white"
                          : "bg-black/5 dark:bg-white/10 text-[#6E6E73] dark:text-[#A1A1A6]"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <h4 className="font-semibold text-xs text-[#1D1D1F] dark:text-[#F5F5F7] mb-1">
                    {node.title}
                  </h4>
                  <p className="text-[11px] text-[#6E6E73] dark:text-[#A1A1A6] line-clamp-2 leading-relaxed">
                    {node.shortDesc}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-[#D2D2D7]/30 dark:border-white/10 text-[10px] font-mono text-[#0071E3] dark:text-[#2997FF] truncate">
                  {node.metric}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Expanded Node Deep-Dive Drawer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeNode.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="mt-2 p-5 rounded-xl bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-[#D2D2D7]/40 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold text-[#0071E3]">
                NODE {activeNode.step} SPECIFICATION
              </span>
              <span className="text-xs text-[#86868B]">&bull;</span>
              <span className="text-xs font-medium text-[#1D1D1F] dark:text-[#F5F5F7]">
                {activeNode.title}
              </span>
            </div>
            <p className="text-xs md:text-sm text-[#1D1D1F] dark:text-[#F5F5F7] leading-relaxed">
              {activeNode.details}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="px-3.5 py-2 rounded-lg bg-white dark:bg-[#161617] border border-[#D2D2D7]/60 dark:border-white/10 font-mono text-xs text-[#1D1D1F] dark:text-[#F5F5F7] shadow-xs">
              <span className="text-[#86868B]">Invariant: </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{activeNode.metric}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
