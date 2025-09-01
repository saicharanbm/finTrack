import { Router } from "express";
export const router = Router();
import { authRouter } from "./authRouter";
import { transactionsRouter } from "./transactionsRouter";
import { verifyUser } from "../middlewares/verifyUser";
import { analyticsRouter } from "./analyticsRouter";

router.use("/auth", authRouter);
router.use("api/transactions", verifyUser, transactionsRouter);
router.use("/api/analytics", verifyUser, analyticsRouter);
