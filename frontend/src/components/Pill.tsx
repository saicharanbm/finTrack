import { cn } from "@/utils";
import React from "react";
type PillProps = {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
};

function Pill({ children, active, onClick }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-sm border text-white",
        active
          ? "bg-theme  border-white/30"
          : "bg-theme/35  border-white/10 hover:bg-gray-600 dark:hover:bg-white/10"
      )}
    >
      {children}
    </button>
  );
}

export default Pill;
