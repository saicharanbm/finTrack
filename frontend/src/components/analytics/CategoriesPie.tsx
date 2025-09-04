import { useTransactionsByCategory } from "@/services/queries";
import type { RangeKey } from "@/types";
import { fmtINR } from "@/utils/helper";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartLoader from "../shimmer/ChartLoader";

type CategoryPoint = {
  name: string;
  value: number;
  totalPaise: number;
};

const ENHANCED_COLORS = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#f97316", // orange
  "#ec4899", // pink
  "#06b6d4", // cyan
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if percentage is greater than 5%
  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function EnhancedCategoriesPie({ range }: { range: RangeKey }) {
  const { data, isLoading, isError } = useTransactionsByCategory(range);

  if (isLoading) {
    return <ChartLoader />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-white/90 dark:bg-[#0f172a] p-5">
        <div className="flex items-center gap-2 text-sm text-rose-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Failed to load category data
        </div>
      </div>
    );
  }

  const chartData: CategoryPoint[] = data.items.map((it: any) => ({
    name: String(it.category),
    value: Number(it.percent),
    totalPaise: Number(it.totalPaise ?? 0),
  }));

  const totalAmount = chartData.reduce((sum, item) => sum + item.totalPaise, 0);

  return (
    <div className="rounded-2xl border border-white/10 bg-white dark:bg-[#0f172a] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Spending by Category</h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Total: {fmtINR(totalAmount)}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={65}
              outerRadius={110}
              paddingAngle={1}
              labelLine={false}
              label={renderCustomizedLabel}
            >
              {chartData.map((_: CategoryPoint, idx: number) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={ENHANCED_COLORS[idx % ENHANCED_COLORS.length]}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string, props: any) => {
                const { payload } = props;
                return [
                  `${value.toFixed(1)}% (${fmtINR(payload.totalPaise)})`,
                  name,
                ];
              }}
              contentStyle={{
                border: "none",
                borderRadius: "8px",
                color: "#ffffff",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{ paddingTop: "20px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
