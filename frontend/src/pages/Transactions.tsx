import React from "react";
import TransactionContainer from "@/components/transactions/TransactionContainer";
import type { RangeKey } from "@/types";
import PillControls from "@/components/PillControls";

export default function Transactions() {
  const [range, setRange] = React.useState<RangeKey>("month");

  return (
    <div className="p-4 sm:p-6  overflow-y-auto">
      <PillControls title="Transactions" range={range} setRange={setRange} />
      <div className=" flex-1 py-6">
        <TransactionContainer range={range} />
      </div>
    </div>
  );
}
