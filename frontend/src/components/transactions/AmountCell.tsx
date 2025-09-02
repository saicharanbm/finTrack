import { cn } from "@/utils";
import React from "react";
import { formatMoney } from "@/utils/helper";
export const AmountCell: React.FC<{
  type: "INCOME" | "EXPENSE";
  paise: number;
}> = ({ type, paise }) => (
  <span
    className={cn(
      "font-semibold",
      type === "INCOME" ? "text-emerald-500" : "text-rose-500"
    )}
  >
    {formatMoney(Number(paise), type)}
  </span>
);
