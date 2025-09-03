import type { RangeKey } from "@/types";
import CategoriesPie from "@/components/analytics/CategoriesPie";
import SummaryCards from "@/components/analytics/SummaryCards";
import TrendsChart from "@/components/analytics/TrendsChart";
import { useState } from "react";
import { ranges } from "@/utils/constsnts";
import Pill from "@/components/Pill";

function Analytics() {
  const [range, setRange] = useState<RangeKey>("month");

  return (
    <div>
      <div className="p-4 sm:p-6 space-y-6 overflow-auto">
        {/* Header + Range */}
        <div className="flex flex-col flex-wrap    gap-6">
          <h1 className="text-2xl font-bold text-left">Analytics</h1>
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
      </div>
    </div>
  );
}

export default Analytics;
