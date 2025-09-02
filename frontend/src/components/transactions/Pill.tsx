import { cn } from "@/utils";
import React from "react";
export const Pill: React.FC<{
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}> = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      "rounded-full px-3 py-1 text-sm border text-white",
      active
        ? "bg-theme  border-white/30"
        : "bg-theme/35  border-white/10 hover:bg-white/10"
    )}
  >
    {children}
  </button>
);
