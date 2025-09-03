import React from "react";
import SummaryCards from "@/components/analytics/SummaryCards";
import CategoriesPie from "@/components/analytics/CategoriesPie";
import TrendsChart from "@/components/analytics/TrendsChart";
import Pill from "@/components/Pill";
import { ranges } from "@/utils/constsnts";
import TransactionContainer from "@/components/transactions/TransactionContainer";

export type RangeKey = "week" | "month" | "3month" | "year" | "all";

export default function Dashboard() {
  const [range, setRange] = React.useState<RangeKey>("month");

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-auto">
      {/* Header + Range */}
      <div className="flex flex-col flex-wrap    gap-6">
        <h1 className="text-2xl font-bold text-left">Dashboard</h1>
        <div className="flex justify-end">
          <div className="flex flex-wrap items-center gap-2">
            {ranges.map((r) => (
              <Pill
                key={r.key}
                active={range === r.key}
                onClick={() => setRange(r.key)}
              >
                {r.label}
              </Pill>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <SummaryCards range={range} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoriesPie range={range} />
        <TrendsChart range={range} />
      </div>
      <TransactionContainer range={range} />
    </div>
  );
}
