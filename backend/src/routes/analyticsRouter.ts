import { Router } from "express";
import { RangeKey } from "../types";
import { RangeSchema } from "../types/zod";
import { Prisma } from "@prisma/client";
import { getSinceDate } from "../utils/helper";
import { prisma } from "../db/prisma";

export const analyticsRouter = Router();

/** choose a sensible bucket size for the trend chart */
function bucketFor(range?: RangeKey): "day" | "month" {
  if (!range) return "month";
  if (range === "week" || range === "month") return "day";
  return "month"; // 3month/year/all → month buckets
}

const toNumber = (b: bigint | number | null | undefined) =>
  typeof b === "bigint" ? Number(b) : b ?? 0;

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

    // We restrict the date_trunc literal to two safe options → no injection risk
    const dtLiteral = bucket === "day" ? "day" : "month";

    // bucket as ISO date string (YYYY-MM-DD for day, YYYY-MM-01 for month)
    const rows: Array<{
      bucket: string;
      income: string | null;
      expense: string | null;
    }> = await prisma.$queryRawUnsafe(
      `
        SELECT
          to_char(date_trunc('${dtLiteral}', "date"), 'YYYY-MM-DD') AS bucket,
          SUM(CASE WHEN "type" = 'INCOME'  THEN "amountPaise" ELSE 0 END) AS income,
          SUM(CASE WHEN "type" = 'EXPENSE' THEN "amountPaise" ELSE 0 END) AS expense
        FROM "Transaction"
        WHERE "creatorId" = $1
          ${since ? `AND "date" >= $2` : ``}
        GROUP BY 1
        ORDER BY 1 ASC
        `,
      ...(since ? [userId, since] : [userId])
    );

    const points = rows.map((r) => ({
      bucket: r.bucket, // e.g., '2025-06-01' (month) or '2025-06-14' (day)
      incomePaise: Number(r.income ?? 0),
      expensePaise: Number(r.expense ?? 0),
    }));

    res.status(200).json({ range, bucket, points });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
});
