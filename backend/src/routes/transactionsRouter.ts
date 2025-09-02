import { Router } from "express";
import { client, openAISchema, systemPrompt } from "../ai";
import {
  GetAllQuerySchema,
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

// create single transaction
transactionsRouter.post("/", async (req, res) => {
  const { userId } = req;

  // 1) validate request body
  const parsed = TransactionDataSchema.safeParse(req.body.data);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed" });
  }
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
});

transactionsRouter.get("/", (req, res) => {
  res.status(201).json({ message: "Get Transaction" });
});

transactionsRouter.put("/:id", async (req, res, next) => {
  try {
    const { userId } = req as any;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const id = req.params.id;
    const parsed = UpdateTransactionSchema.safeParse(req.body.data);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation failed" });
    }

    // Ensure the transaction belongs to the user
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing || existing.creatorId !== userId) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const data: Prisma.TransactionUpdateInput = {
      ...("title" in parsed.data ? { title: parsed.data.title } : {}),
      ...("amountPaise" in parsed.data
        ? { amountPaise: parsed.data.amountPaise! }
        : {}),
      ...("category" in parsed.data ? { category: parsed.data.category! } : {}),
      ...("type" in parsed.data ? { type: parsed.data.type! } : {}),
      ...("date" in parsed.data ? { date: parsed.data.date! } : {}),
    };

    const updated = await prisma.transaction.update({ where: { id }, data });
    res.status(200).json({
      message: "Transaction updated",
      transaction: serializeTxn(updated),
    });
  } catch (err) {
    next(err);
  }
});

transactionsRouter.delete("/:id", async (req, res, next) => {
  try {
    const { userId } = req as any;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const id = req.params.id;

    // Ensure ownership first
    const existing = await prisma.transaction.findUnique({ where: { id } });
    if (!existing || existing.creatorId !== userId) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    await prisma.transaction.delete({ where: { id } });
    // 204 is ideal if you return no body
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

transactionsRouter.post("/bulk", async (req, res) => {
  const { userId } = req;
  // Validate request body
  const parsed = TransactionsArraySchema.safeParse(req.body.data);
  if (!parsed.success) {
    return res.status(400).json({ message: "Validation failed" });
  }
  const transactions = parsed.data;

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
  await prisma.transaction.createMany({
    data: transactionsToCreate,
  });

  // Convert BigInt to number for JSON serialization

  res.status(201).json({
    message: "Transactions created successfully",
  });
});

transactionsRouter.post("/parse", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    res
      .status(401)
      .json({ type: "incomplete", message: "message cant be empty." });
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
    res.status(401).json({
      data: {
        type: "incomplete",
        message:
          "Sorry, I couldn't understand your transaction description. Please provide the amount, what it was for, and whether it was income or an expense.",
      },
    });
  }
});
