import { useTransactionsTrends } from "@/services/queries";
import type { RangeKey } from "@/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import ChartLoader from "../shimmer/ChartLoader";

export default function EnhancedTrendsChart({ range }: { range: RangeKey }) {
  const { data, isLoading, isError } = useTransactionsTrends(range);

  if (isLoading) {
    return <ChartLoader />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-white dark:bg-[#0f172a] p-5">
        <div className="flex items-center gap-2 text-sm text-rose-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Failed to load trends data
        </div>
      </div>
    );
  }

  const points = (data.points as any[]).map((p) => ({
    bucket: p.bucket,
    income: p.incomePaise / 100,
    expense: p.expensePaise / 100,
    net: (p.incomePaise - p.expensePaise) / 100,
  }));

  // Calculate average values for reference lines
  const avgIncome =
    points.reduce((sum, p) => sum + p.income, 0) / points.length;
  const avgExpense =
    points.reduce((sum, p) => sum + p.expense, 0) / points.length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white dark:bg-[#0f172a] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Income vs Expenses Trend</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded"></div>
            <span>
              Avg:{" "}
              {avgIncome.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>
              Avg:{" "}
              {avgExpense.toLocaleString("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={points}
            margin={{ left: 20, right: 20, top: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              dataKey="bucket"
              tickFormatter={(v: string) => {
                const d = new Date(v);
                return data.bucket === "month"
                  ? d.toLocaleString("en-US", { month: "short" })
                  : d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "2-digit",
                    });
              }}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(v: number) =>
                v >= 1000
                  ? `₹${(v / 1000).toFixed(0)}K`
                  : v.toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 0,
                    })
              }
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                value.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                }),
                name === "income"
                  ? "Income"
                  : name === "expense"
                  ? "Expense"
                  : "Net",
              ]}
              labelFormatter={(label: string) =>
                new Date(label).toLocaleDateString("en-IN")
              }
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                border: "none",
                borderRadius: "8px",
                color: "white",
              }}
            />
            <Legend />

            {/* Reference lines for averages */}
            <ReferenceLine
              y={avgIncome}
              stroke="#16a34a"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            />
            <ReferenceLine
              y={avgExpense}
              stroke="#ef4444"
              strokeDasharray="5 5"
              strokeOpacity={0.5}
            />

            <Line
              type="monotone"
              dataKey="income"
              dot={{ r: 4, fill: "#16a34a" }}
              stroke="#16a34a"
              strokeWidth={3}
              activeDot={{ r: 6, fill: "#16a34a" }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              dot={{ r: 4, fill: "#ef4444" }}
              stroke="#ef4444"
              strokeWidth={3}
              activeDot={{ r: 6, fill: "#ef4444" }}
            />
            <Line
              type="monotone"
              dataKey="net"
              dot={{ r: 3, fill: "#6b7280" }}
              stroke="#6b7280"
              strokeWidth={2}
              strokeDasharray="3 3"
              activeDot={{ r: 5, fill: "#6b7280" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
