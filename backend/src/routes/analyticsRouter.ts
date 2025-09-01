import { Router } from "express";

export const analyticsRouter = Router();

analyticsRouter.get("/summary", (req, res) => {
  res.status(200).json({ message: "Get Summary Analytics" });
});
analyticsRouter.get("/categories", (req, res) => {
  res.status(200).json({ message: "Get Categories Analytics" });
});
analyticsRouter.get("/trends", (req, res) => {
  res.status(200).json({ message: "Get Trends Analytics" });
});
