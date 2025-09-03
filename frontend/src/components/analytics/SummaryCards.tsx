import React from "react";
import { useTransactionsSummary } from "@/services/queries"; // your hooks file
import type { RangeKey } from "@/types";

const fmtINR = (paise: number) =>
  (paise / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" });

const Card: React.FC<{
  title: string;
  value: string;
  accent?: "green" | "red" | "blue";
}> = ({ title, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white dark:bg-[#0f172a] p-5 shadow">
    <div className="text-sm text-gray-500 dark:text-gray-300">{title}</div>
    <div className="mt-1 text-2xl font-semibold">{value}</div>
  </div>
);

export default function SummaryCards({ range }: { range: RangeKey }) {
  const { data, isLoading, isError } = useTransactionsSummary(range);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl border border-white/10 bg-white/90 dark:bg-white/5 animate-pulse"
          />
        ))}
      </div>
    );
  }
  if (isError || !data) {
    return <div className="text-sm text-rose-500">Failed to load summary.</div>;
  }

  const income = fmtINR(data.totalIncomePaise ?? 0);
  const expense = fmtINR(data.totalExpensePaise ?? 0);
  const savings = fmtINR(data.savingsPaise ?? 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card title="Total Balance" value={income} accent="blue" />
      <Card title="Expenses" value={expense} accent="red" />
      <Card title="Savings" value={savings} accent="green" />
    </div>
  );
}
