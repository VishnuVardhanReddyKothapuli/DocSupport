import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Clock, Code2, Copy, Check, ShieldCheck, Terminal, Sparkles, CheckCircle2 } from "lucide-react";
import { AnimatedNumber } from "./ui/animated-counter";
import { Badge } from "./ui/badge";

interface DemoScenario {
  id: string;
  tabLabel: string;
  repo: string;
  commit: string;
  query: string;
  answer: string;
  citationFile: string;
  citationLines: string;
  citationCode: string;
  matchScore: number;
  latencyMs: number;
}

const SCENARIOS: DemoScenario[] = [
  {
    id: "fastapi",
    tabLabel: "FastAPI Dependency Context",
    repo: "git:github.com/fastapi/fastapi (main:e4f9b2c)",
    commit: "e4f9b2c",
    query: "How does the dependency injection system resolve scoped yields and teardowns in FastAPI?",
    answer: "FastAPI executes dependency resolution via an asynchronous exit stack context manager. When a dependency uses a yield statement, execution pauses at the yield point while the endpoint runs, and finalizers execute during request teardown in reverse dependency order [1].",
    citationFile: "fastapi/dependencies/utils.py",
    citationLines: "Lines 145 – 182",
    citationCode: `async def solve_dependencies(
    *,
    request: Request,
    dependant: Dependant,
    async_exit_stack: AsyncExitStack,
):
    # Yield-dependency execution
    if is_gen_callable(call):
        cm = contextmanager_in_threadpool(...)
        yielded = await async_exit_stack.enter_async_context(cm)
        return yielded`,
    matchScore: 94.2,
    latencyMs: 142,
  },
  {
    id: "pytorch",
    tabLabel: "PyTorch Attention Scaler",
    repo: "git:github.com/pytorch/pytorch (main:9a8d21c)",
    commit: "9a8d21c",
    query: "How does scaled dot product attention calculate causal masking and dropout scale factors?",
    answer: "The scaled dot product kernel multiplies Query and Key tensors, divides logits by sqrt(d_k), applies additive boolean lower-triangular causal masks, and renormalizes values across the Softmax dimension before matrix multiplication with Value [1].",
    citationFile: "torch/nn/functional.py",
    citationLines: "Lines 5120 – 5158",
    citationCode: `def scaled_dot_product_attention(
    query, key, value, attn_mask=None, dropout_p=0.0, is_causal=False
):
    scale_factor = 1 / math.sqrt(query.size(-1))
    attn_weight = query @ key.transpose(-2, -1) * scale_factor
    if is_causal:
        attn_weight += causal_mask
    return softmax(attn_weight, dim=-1) @ value`,
    matchScore: 96.8,
    latencyMs: 118,
  },
  {
    id: "celery",
    tabLabel: "Celery Late ACK Delivery",
    repo: "git:github.com/celery/celery (master:c3b4012)",
    commit: "c3b4012",
    query: "Where is task_acks_late handled to prevent message loss upon worker termination?",
    answer: "When task_acks_late is enabled, Celery defers message acknowledgement on the AMQP broker channel until after the task function either finishes or raises an unhandled exception, ensuring tasks remain queued if worker containers crash midway [1].",
    citationFile: "celery/worker/strategy.py",
    citationLines: "Lines 88 – 116",
    citationCode: `if not acks_late:
    message.ack()
try:
    handle(message)
finally:
    if acks_late:
        message.ack()`,
    matchScore: 91.5,
    latencyMs: 156,
  },
];

export function HeroInteractiveDemo() {
  const [selectedId, setSelectedId] = React.useState<string>("fastapi");
  const [copied, setCopied] = React.useState(false);

  const scenario = SCENARIOS.find((s) => s.id === selectedId) || SCENARIOS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(scenario.citationCode);
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
            {scenario.repo}
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
                  <Code2 className="w-3.5 h-3.5 text-[#0071E3]" />
                  Citation [1] Evidence
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
                  {scenario.citationFile}
                </div>
                <div>{scenario.citationLines} &bull; commit: {scenario.commit}</div>
              </div>

              {/* Verbatim Code Chunk with Copy Button */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-white/80 dark:bg-black/50 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] backdrop-blur-sm transition-all opacity-80 group-hover:opacity-100 shadow-xs"
                  title="Copy verbatim code chunk"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <pre className="p-3.5 rounded-xl bg-[#F5F5F7] dark:bg-[#1A1A1C] border border-[#D2D2D7]/40 dark:border-white/10 text-[11px] font-mono text-[#1D1D1F] dark:text-[#F5F5F7] overflow-x-auto leading-relaxed">
                  {scenario.citationCode}
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
