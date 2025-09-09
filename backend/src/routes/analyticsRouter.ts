import { Router } from "express";
import { RangeKey } from "../types";
import { RangeSchema } from "../types/zod";
import { Prisma } from "@prisma/client";
import { getSinceDate, serializeTxns } from "../utils/helper";
import { prisma } from "../db/prisma";

export const analyticsRouter = Router();

interface TrendPoint {
  bucket: string;
  incomePaise: number;
  expensePaise: number;
}

/** choose a sensible bucket size for the trend chart */
function bucketFor(range?: RangeKey): "day" | "month" {
  if (!range) return "month";
  if (range === "week" || range === "month") return "day";
  return "month"; // 3month/year/all → month buckets
}

const toNumber = (b: bigint | number | null | undefined) =>
  typeof b === "bigint" ? Number(b) : b ?? 0;

function formatDateForBucket(date: Date, bucket: "day" | "month"): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  if (bucket === "day") {
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  } else {
    return `${year}-${month}-01`;
  }
}

function groupTransactionsByBucket(
  transactions: Array<{
    date: Date;
    type: "INCOME" | "EXPENSE";
    amountPaise: number;
  }>,
  bucket: "day" | "month"
): Map<string, { income: number; expense: number }> {
  const grouped = new Map<string, { income: number; expense: number }>();

  for (const transaction of transactions) {
    const bucketKey = formatDateForBucket(transaction.date, bucket);

    if (!grouped.has(bucketKey)) {
      grouped.set(bucketKey, { income: 0, expense: 0 });
    }

    const bucketData = grouped.get(bucketKey)!;
    if (transaction.type === "INCOME") {
      bucketData.income += transaction.amountPaise;
    } else {
      bucketData.expense += transaction.amountPaise;
    }
  }

  return grouped;
}

analyticsRouter.get("/summary", async (req, res) => {
  try {
    const { userId } = req as any;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    console.log("params", req.query?.range);

    const parsed = RangeSchema.safeParse(req.query?.range);
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid query params" });
    const range = (parsed.data ?? "all") as RangeKey;

    const since = getSinceDate(range);
    const baseWhere: Prisma.TransactionWhereInput = {
      creatorId: userId,
      ...(since ? { date: { gte: since } } : {}),
    };

    const [incomeAgg, expenseAgg] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...baseWhere, type: "INCOME" },
        _sum: { amountPaise: true },
      }),
      prisma.transaction.aggregate({
        where: { ...baseWhere, type: "EXPENSE" },
        _sum: { amountPaise: true },
      }),
    ]);

    const totalIncomePaise = toNumber(incomeAgg._sum.amountPaise);
    const totalExpensePaise = toNumber(expenseAgg._sum.amountPaise);
    const netPaise = totalIncomePaise - totalExpensePaise;

    res.status(200).json({
      range,
      totalIncomePaise,
      totalExpensePaise,
      savingsPaise: netPaise,
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});
// Returns EXPENSES grouped by category with totals + percentage of total.
analyticsRouter.get("/categories", async (req, res) => {
  try {
    const { userId } = req as any;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const parsed = RangeSchema.safeParse(req.query?.range);
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid query params" });
    const range = (parsed.data ?? "all") as RangeKey;

    const since = getSinceDate(range);

    const grouped = await prisma.transaction.groupBy({
      by: ["category"],
      where: {
        creatorId: userId,
        type: "EXPENSE",
        ...(since ? { date: { gte: since } } : {}),
      },
      _sum: { amountPaise: true },
      orderBy: { _sum: { amountPaise: "desc" } },
    });

    const totalExpensePaise = grouped.reduce(
      (acc, r) => acc + toNumber(r._sum.amountPaise),
      0
    );

    const items = grouped.map((r) => {
      const totalPaise = toNumber(r._sum.amountPaise);
      const percent =
        totalExpensePaise > 0 ? (totalPaise / totalExpensePaise) * 100 : 0;
      return {
        category: r.category, // enum value
        totalPaise,
        percent: Number(percent.toFixed(2)),
      };
    });

    res.status(200).json({
      range,
      totalExpensePaise,
      items,
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});
// Returns income vs expense per bucket (day or month) for time-series chart.
analyticsRouter.get("/trends", async (req, res) => {
  try {
    const { userId } = req as any;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const parsed = RangeSchema.safeParse(req.query?.range);
    if (!parsed.success)
      return res.status(400).json({ message: "Invalid query params" });
    const range = (parsed.data ?? "month") as RangeKey;

    const since = getSinceDate(range);
    const bucket = bucketFor(range); // 'day' | 'month'

    const transactions = await prisma.transaction.findMany({
      where: {
        creatorId: userId,
        ...(since ? { date: { gte: since } } : {}),
      },
      select: {
        date: true,
        type: true,
        amountPaise: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    const grouped = groupTransactionsByBucket(
      serializeTxns(transactions),
      bucket
    );

    // Convert to array and sort
    const points: TrendPoint[] = Array.from(grouped.entries())
      .map(([bucketKey, data]) => ({
        bucket: bucketKey,
        incomePaise: data.income,
        expensePaise: data.expense,
      }))
      .sort((a, b) => a.bucket.localeCompare(b.bucket));

    res.status(200).json({ range, bucket, points });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});
