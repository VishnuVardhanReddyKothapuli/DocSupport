import * as React from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "glow" | "destructive";
  size?: "default" | "sm" | "lg" | "icon" | "pill";
  isLoading?: boolean;
}

const getButtonClasses = (variant = "default", size = "default", className = "") => {
  const base = "relative inline-flex items-center justify-center font-medium transition-all select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071E3]/50";

  const variants: Record<string, string> = {
    default: "bg-[#0071E3] hover:bg-[#0077ED] text-white shadow-sm active:scale-[0.98]",
    secondary: "bg-black/5 dark:bg-white/10 text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/10 dark:hover:bg-white/15",
    outline: "border border-[#D2D2D7] dark:border-white/15 bg-transparent text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/5",
    ghost: "text-[#1D1D1F] dark:text-[#F5F5F7] hover:bg-black/5 dark:hover:bg-white/10",
    link: "text-[#0071E3] dark:text-[#2997FF] underline-offset-4 hover:underline p-0 h-auto",
    glow: "bg-gradient-to-r from-[#0071E3] to-[#4F46E5] text-white shadow-[0_0_20px_rgba(0,113,227,0.35)] hover:shadow-[0_0_28px_rgba(0,113,227,0.5)]",
    destructive: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm",
  };

  const sizes: Record<string, string> = {
    default: "h-9 px-4 py-2 text-xs rounded-xl",
    sm: "h-8 px-3 text-xs rounded-lg",
    lg: "h-11 px-6 text-sm rounded-2xl",
    icon: "h-9 w-9 p-0 rounded-xl justify-center",
    pill: "h-10 px-6 text-xs rounded-full",
  };

  return cn(base, variants[variant] || variants.default, sizes[size] || sizes.default, className);
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={getButtonClasses(variant, size, className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export interface MotionButtonProps extends Omit<HTMLMotionProps<"button">, "size" | "children"> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "link" | "glow" | "destructive";
  size?: "default" | "sm" | "lg" | "icon" | "pill";
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const MotionButton = React.forwardRef<HTMLButtonElement, MotionButtonProps>(
  ({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.97, y: 1 }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        disabled={disabled || isLoading}
        className={getButtonClasses(variant, size, className)}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);
MotionButton.displayName = "MotionButton";
