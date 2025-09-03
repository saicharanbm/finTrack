import React from "react";

import Pill from "@/components/Pill";

import { ranges } from "@/utils/constsnts";
import TransactionContainer from "@/components/transactions/TransactionContainer";
import type { RangeKey } from "@/types";

export default function Transactions() {
  const [range, setRange] = React.useState<RangeKey>("month");

  return (
    <div className="p-4 sm:p-6  overflow-y-auto">
      {/* header + range filter */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <div className="flex flex-wrap items-center gap-2">
          {ranges.map((r) => (
            <Pill
              key={r.key}
              active={range === r.key}
              onClick={() => {
                setRange(r.key);
              }}
            >
              {r.label}
            </Pill>
          ))}
        </div>
      </div>

      {/* table */}
      <TransactionContainer range={range} />
    </div>
  );
}
