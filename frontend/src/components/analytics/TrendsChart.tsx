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
} from "recharts";

export default function TrendsChart({ range }: { range: RangeKey }) {
  const { data, isLoading, isError } = useTransactionsTrends(range);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/90 dark:bg-white/5 p-5 h-[340px] animate-pulse" />
    );
  }
  if (isError || !data) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white dark:bg-[#0f172a] p-5">
        <div className="text-sm text-rose-500">Failed to load trends.</div>
      </div>
    );
  }

  const points = (data.points as any[]).map((p) => ({
    bucket: p.bucket, // YYYY-MM-DD
    income: p.incomePaise / 100,
    expense: p.expensePaise / 100,
  }));

  return (
    <div className="rounded-2xl border border-white/10 bg-white dark:bg-[#0f172a] p-5">
      <h3 className="mb-3 text-lg font-semibold">Income vs Expenses Trend</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={points}
            margin={{ left: 8, right: 8, top: 10, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
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
            />
            <YAxis
              tickFormatter={(v: number) =>
                v.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                })
              }
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                value.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                }),
                name === "income" ? "Income" : "Expense",
              ]}
              labelFormatter={(label: string) => new Date(label).toDateString()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              dot={false}
              stroke="#16a34a"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="expense"
              dot={false}
              stroke="#ef4444"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
