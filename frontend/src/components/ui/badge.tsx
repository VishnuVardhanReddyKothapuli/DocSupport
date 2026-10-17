import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

const badgeVariants = (variant?: string, className?: string) => {
  const base = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-all select-none";
  
  const variants: Record<string, string> = {
    default: "bg-[#0071E3] text-white shadow-xs hover:bg-[#0077ED]",
    secondary: "bg-black/5 dark:bg-white/10 text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/10 dark:hover:bg-white/15",
    destructive: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    outline: "text-[#6E6E73] dark:text-[#A1A1A6] border border-[#D2D2D7] dark:border-white/15 bg-transparent",
    glow: "bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-[#0071E3] dark:text-[#2997FF] border border-blue-500/20 shadow-[0_0_12px_rgba(0,113,227,0.15)]",
  };

  return cn(base, variants[variant || "default"] || variants.default, className);
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "success" | "outline" | "glow";
  dot?: boolean;
  dotColor?: string;
  pulse?: boolean;
}

export function Badge({
  className,
  variant = "default",
  dot = false,
  dotColor,
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={badgeVariants(variant, className)} {...props}>
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                dotColor || (variant === "success" ? "bg-emerald-400" : variant === "destructive" ? "bg-rose-400" : "bg-blue-400")
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              dotColor || (variant === "success" ? "bg-emerald-500" : variant === "destructive" ? "bg-rose-500" : "bg-blue-500")
            )}
          />
        </span>
      )}
      {children}
    </div>
  );
}

export type AnimatedBadgeProps = BadgeProps & Omit<HTMLMotionProps<"div">, "children"> & {
  children?: React.ReactNode;
};

export function AnimatedBadge({
  className,
  variant = "default",
  dot = false,
  dotColor,
  pulse = false,
  children,
  ...props
}: AnimatedBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={badgeVariants(variant, className)}
      {...props}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                dotColor || (variant === "success" ? "bg-emerald-400" : variant === "destructive" ? "bg-rose-400" : "bg-blue-400")
              )}
            />
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full h-2 w-2",
              dotColor || (variant === "success" ? "bg-emerald-500" : variant === "destructive" ? "bg-rose-500" : "bg-blue-500")
            )}
          />
        </span>
      )}
      {children}
    </motion.div>
  );
}
