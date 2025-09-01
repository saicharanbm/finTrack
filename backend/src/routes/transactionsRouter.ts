import { Router } from "express";

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
transactionsRouter.post("/parse", (req, res) => {
  res.status(201).json({ message: "Transaction  parse created" });
});
