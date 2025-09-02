import { Router } from "express";
import { client, openAISchema, systemPrompt } from "../ai";
import {
  GetQuerySchema,
  normalizeResponse,
  TransactionDataSchema,
  TransactionResponseSchema,
  TransactionsArraySchema,
  UpdateTransactionSchema,
} from "../types/zod";
import { prisma } from "../db/prisma";
import { Prisma, Category, TransactionType } from "@prisma/client";

export const transactionsRouter = Router();
const parseDate = (dateStr: string | undefined) => {
  if (!dateStr) return new Date(); // Default to current date

  const [day, month, year] = dateStr.split("/");
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
};

/** Serialize a single transaction (BigInt -> number). */
function serializeTxn(t: any) {
  return {
    ...t,
    amountPaise:
      typeof t.amountPaise === "bigint" ? Number(t.amountPaise) : t.amountPaise,
  };
}

/** Serialize an array of transactions. */
function serializeTxns(txns: any[]) {
  return txns.map(serializeTxn);
}

/** Range helper: compute lower bound date; undefined => all time */
function getSinceDate(range?: string): Date | undefined {
  if (!range) return undefined;
  const now = new Date();
  const d = new Date(now);
  switch (range.toLowerCase()) {
    case "week":
    case "last-week":
    case "7d":
      d.setDate(now.getDate() - 7);
      return d;
    case "month":
    case "last-month":
    case "30d":
      d.setMonth(now.getMonth() - 1);
      return d;
    case "3month":
    case "3months":
    case "quarter":
    case "90d":
      d.setMonth(now.getMonth() - 3);
      return d;
    case "year":
    case "last-year":
    case "365d":
      d.setFullYear(now.getFullYear() - 1);
      return d;
    case "all":
    case "all-time":
      return undefined;
    default:
      return undefined;
  }
}
// create single transaction
transactionsRouter.post("/", async (req, res) => {
  const { userId } = req;

  // 1) validate request body
  const parsed = TransactionDataSchema.safeParse(req.body.data);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed" });
  }
  try {
    const t = parsed.data;

    // 2) map to Prisma.TransactionCreateInput
    const transactionToCreate: Prisma.TransactionCreateInput = {
      amountPaise: BigInt(t.amountPaise),
      category: t.category as Category,
      type: t.type as TransactionType,
      title: t.title,
      date: parseDate(t.date),
      creator: { connect: { id: userId as string } }, // relation style for single create
    };

    // 3) create single resource
    const created = await prisma.transaction.create({
      data: transactionToCreate,
    });

    // 4) respond
    res.status(201).json({
      message: "Transaction created successfully",
      transaction: {
        ...created,
        amountPaise: Number(created.amountPaise), // serialize BigInt
      },
    });
  } catch (error) {
    console.error("Transaction creation error:", error); // Add logging

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return res.status(400).json({ message: "Invalid user reference" });
      }
    }

    res.status(500).json({
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
});

transactionsRouter.get("/", async (req, res) => {
  const { userId } = req as any; // set by your auth middleware

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const parsed = GetQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid query params" });
  }

  try {
    const { range, page = 1, pageSize = 50 } = parsed.data;

    const since = getSinceDate(range);
    const where: Prisma.TransactionWhereInput = {
      creatorId: userId,
      ...(since ? { date: { gte: since } } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.status(200).json({
      range: range ?? "all",
      page,
      pageSize,
      total,
      items: serializeTxns(items),
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
});

transactionsRouter.put("/:id", async (req, res) => {
  const { userId } = req as any;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ message: "Transaction ID is required" });
  }

  const parsed = UpdateTransactionSchema.safeParse(req.body?.data);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed" });
  }

  try {
    // Ensure the transaction belongs to the user
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing || existing.creatorId !== userId) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const data: Prisma.TransactionUpdateInput = {
      ...("title" in parsed.data ? { title: parsed.data.title } : {}),
      ...("amountPaise" in parsed.data
        ? { amountPaise: BigInt(parsed.data.amountPaise!) }
        : {}), // Convert to BigInt
      ...("category" in parsed.data ? { category: parsed.data.category! } : {}),
      ...("type" in parsed.data ? { type: parsed.data.type! } : {}),
      ...("date" in parsed.data ? { date: parseDate(parsed.data.date!) } : {}),
    };

    const updated = await prisma.transaction.update({ where: { id }, data });

    res.status(200).json({
      message: "Transaction updated",
      transaction: serializeTxn(updated),
    });
  } catch (error) {
    console.error("Error updating transaction:", error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Transaction not found" });
      }
    }

    res.status(500).json({
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
});

transactionsRouter.delete("/:id", async (req, res) => {
  const { userId } = req as any;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ message: "Transaction ID is required" });
  }

  try {
    // Ensure ownership first
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing || existing.creatorId !== userId) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await prisma.transaction.delete({ where: { id } });

    // 204 is ideal if you return no body
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting transaction:", error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return res.status(404).json({ message: "Transaction not found" });
      }
    }

    res.status(500).json({
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
});

transactionsRouter.post("/bulk", async (req, res) => {
  const { userId } = req;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Validate request body
  const parsed = TransactionsArraySchema.safeParse(req.body?.data);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed" });
  }

  try {
    const transactions = parsed.data;

    // Check if array is not empty
    if (!transactions.length) {
      return res.status(400).json({ message: "No transactions to create" });
    }

    // 2) map to Prisma.TransactionCreateManyInput[]
    const transactionsToCreate: Prisma.TransactionCreateManyInput[] =
      transactions.map((t) => ({
        amountPaise: BigInt(t.amountPaise), // JS bigint
        category: t.category as Category, // Prisma enum
        type: t.type as TransactionType, // Prisma enum
        title: t.title,
        date: parseDate(t.date), // Date object
        creatorId: userId as string, // STRING, not Response
      }));

    // Create all transactions in a single transaction
    const result = await prisma.transaction.createMany({
      data: transactionsToCreate,
    });

    res.status(201).json({
      message: "Transactions created successfully",
      count: result.count, // Include how many were created
    });
  } catch (error) {
    console.error("Error creating bulk transactions:", error);

    // Handle specific Prisma errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2003") {
        return res.status(400).json({ message: "Invalid user reference" });
      }
    }

    res.status(500).json({
      message: error instanceof Error ? error.message : "Something went wrong",
    });
  }
});

transactionsRouter.post("/parse", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      // Changed from 401 to 400 (Bad Request)
      type: "incomplete",
      message: "Message cannot be empty.",
    });
  }

  if (typeof message !== "string") {
    return res.status(400).json({
      type: "incomplete",
      message: "Message must be a string.",
    });
  }

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "transaction_parser",
          schema: openAISchema,
          strict: true,
        },
      },
      temperature: 0.1,
    });

    const raw = JSON.parse(completion.choices[0].message.content!);
    console.log("raw", raw);

    const parsed = TransactionResponseSchema.parse(raw);
    const normalized = normalizeResponse(parsed);

    res.json({ data: normalized });
  } catch (error) {
    console.error("Error parsing transaction:", error);

    // Handle different types of errors
    if (error instanceof SyntaxError) {
      return res.status(500).json({
        type: "error",
        message: "Failed to parse AI response.",
      });
    }

    if ((error as Error)?.name === "ZodError") {
      return res.status(500).json({
        type: "error",
        message: "AI response validation failed.",
      });
    }

    // Default fallback for parsing issues
    res.status(422).json({
      // Unprocessable Entity
      type: "incomplete",
      message:
        "Sorry, I couldn't understand your transaction description. Please provide the amount, what it was for, and whether it was income or an expense.",
    });
  }
});
