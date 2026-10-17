import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export function AmbientGlow({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden -z-10", className)}>
      {/* Top glowing radial blur */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.35, 0.55, 0.35],
          x: [0, 20, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 9,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-[180px] left-1/2 -translate-x-1/2 w-[720px] h-[480px] rounded-full bg-gradient-to-tr from-[#0071E3]/20 via-[#4F46E5]/15 to-transparent blur-[110px] dark:from-[#0071E3]/25 dark:via-[#6366F1]/20"
      />

      {/* Floating secondary accent aura */}
      <motion.div
        animate={{
          scale: [1.1, 0.95, 1.1],
          opacity: [0.2, 0.4, 0.2],
          x: [-20, 15, -20],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[280px] -left-20 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-indigo-500/15 via-sky-400/10 to-transparent blur-[100px] dark:from-indigo-500/20"
      />

      {/* Subtle bottom accent */}
      <motion.div
        animate={{
          opacity: [0.15, 0.3, 0.15],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[480px] -right-20 w-[380px] h-[380px] rounded-full bg-gradient-to-tl from-emerald-500/10 via-blue-500/10 to-transparent blur-[90px]"
      />
    </div>
  );
}

export function FloatingGridPattern({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]",
        className
      )}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px]" />
    </div>
  );
}
