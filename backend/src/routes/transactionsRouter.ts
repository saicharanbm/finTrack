import { Router } from "express";
import { client, openAISchema, systemPrompt } from "../ai";
import { normalizeResponse, TransactionResponseSchema } from "../types/zod";

export const transactionsRouter = Router();

transactionsRouter.post("/", (req, res) => {
  res.status(201).json({ message: "Transaction created" });
});
transactionsRouter.get("/", (req, res) => {
  res.status(201).json({ message: "Get Transaction" });
});
transactionsRouter.put("/:id", (req, res) => {
  res.status(201).json({ message: "update Transaction" });
});
transactionsRouter.delete("/:id", (req, res) => {
  res.status(201).json({ message: "delete Transaction" });
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
