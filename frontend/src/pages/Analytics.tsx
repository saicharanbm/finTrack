import type { RangeKey } from "@/types";
import CategoriesPie from "@/components/analytics/CategoriesPie";
import SummaryCards from "@/components/analytics/SummaryCards";
import TrendsChart from "@/components/analytics/TrendsChart";
import { useState } from "react";

import PillControls from "@/components/PillControls";

function Analytics() {
  const [range, setRange] = useState<RangeKey>("month");

  return (
    <div>
      <div className="p-4 sm:p-6 space-y-6 overflow-auto">
        {/* Header + Range */}
        <PillControls title="Analytics" range={range} setRange={setRange} />

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
