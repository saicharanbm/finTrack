import { Router } from "express";
export const router = Router();
import { authRouter } from "./authRouter";
import { transactionsRouter } from "./transactionsRouter";
import { analyticsRouter } from "./analyticsRouter";

router.use("/auth", authRouter);
router.use("api/transactions", transactionsRouter);
router.use("/api/analytics", analyticsRouter);
