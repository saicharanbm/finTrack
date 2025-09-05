import React from "react";
import SummaryCards from "@/components/analytics/SummaryCards";
import CategoriesPie from "@/components/analytics/CategoriesPie";
import TrendsChart from "@/components/analytics/TrendsChart";
import TransactionContainer from "@/components/transactions/TransactionContainer";
import PillControls from "@/components/PillControls";

export type RangeKey = "week" | "month" | "3month" | "year" | "all";

export default function Dashboard() {
  const [range, setRange] = React.useState<RangeKey>("month");

  return (
    <div className="p-4 sm:p-6 space-y-6 overflow-auto">
      {/* Header + Range */}

      <PillControls title="Dashboard" range={range} setRange={setRange} />

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
