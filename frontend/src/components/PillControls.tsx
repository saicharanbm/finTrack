import type { RangeKey } from "@/types";
import { ranges } from "@/utils/constsnts";
import Pill from "./Pill";

type props = {
  title: string;
  range: RangeKey;
  setRange: React.Dispatch<React.SetStateAction<RangeKey>>;
};

function PillControls({ title = "Transactions", range, setRange }: props) {
  return (
    <div className="flex flex-col flex-wrap    gap-6">
      <h1 className="text-2xl font-bold text-left">{title}</h1>
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
  );
}

export default PillControls;
