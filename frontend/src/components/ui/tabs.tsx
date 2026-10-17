import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface TabsContextType {
  value: string;
  onChange: (value: string) => void;
  layoutId: string;
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

export function Tabs({
  value,
  onValueChange,
  defaultValue,
  children,
  className,
  layoutId = "tabs-indicator",
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  children: React.ReactNode;
  className?: string;
  layoutId?: string;
}) {
  const [currentValue, setCurrentValue] = React.useState(value || defaultValue || "");

  const activeValue = value !== undefined ? value : currentValue;
  const handleSelect = (val: string) => {
    if (value === undefined) {
      setCurrentValue(val);
    }
    onValueChange?.(val);
  };

  return (
    <TabsContext.Provider value={{ value: activeValue, onChange: handleSelect, layoutId }}>
      <div className={cn("flex flex-col gap-3", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-start p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-[#D2D2D7]/50 dark:border-white/10 text-[#6E6E73] dark:text-[#A1A1A6]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className,
  disabled = false,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.value === value;

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => context.onChange(value)}
      className={cn(
        "relative px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors z-10 select-none cursor-pointer disabled:opacity-40 disabled:pointer-events-none",
        isActive
          ? "text-[#1D1D1F] dark:text-[#F5F5F7]"
          : "text-[#6E6E73] dark:text-[#A1A1A6] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7]",
        className
      )}
    >
      {isActive && (
        <motion.div
          layoutId={context.layoutId}
          transition={{ type: "spring", stiffness: 450, damping: 32 }}
          className="absolute inset-0 bg-white dark:bg-[#2C2C2E] rounded-lg shadow-xs -z-10 border border-black/5 dark:border-white/10"
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.value !== value) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("focus:outline-none", className)}
    >
      {children}
    </motion.div>
  );
}
