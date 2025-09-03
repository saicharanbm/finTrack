import { useTransactionsByCategory } from "@/services/queries";
import type { RangeKey } from "@/types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type CategoryPoint = {
  name: string;
  value: number; // percent
  totalPaise: number; // absolute for tooltip
};

const COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
];

const fmtINR = (paise: number) =>
  (paise / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" });

export default function CategoriesPie({ range }: { range: RangeKey }) {
  const { data, isLoading, isError } = useTransactionsByCategory(range);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white dark:bg-white/5 p-5 h-[340px] animate-pulse" />
    );
  }
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/90 dark:bg-[#0f172a] p-5">
        <div className="text-sm text-rose-500">Failed to load categories.</div>
      </div>
    );
  }

  const chartData: CategoryPoint[] = data.items.map((it: any) => ({
    name: String(it.category),
    value: Number(it.percent),
    totalPaise: Number(it.totalPaise ?? 0),
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white dark:bg-[#0f172a] p-5">
      <h3 className="mb-3 text-lg font-semibold">Spending by Category</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {chartData.map((_: CategoryPoint, idx: number) => (
                <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                const { payload } = props;
                return [`${value}% (${fmtINR(payload.totalPaise)})`, name];
              }}
            />
            <Legend verticalAlign="bottom" height={28} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
