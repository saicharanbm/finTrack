import { Router } from "express";

export const authRouter = Router();

authRouter.post("/google", async (req, res) => {
  res.send("google");
});

authRouter.post("/refresh", async (req, res) => {
  res.send("refresh");
});

authRouter.post("/logout", async (req, res) => {
  res.send("logout");
});
authRouter.get("/profile", async (req, res) => {
  res.send("profile");
});
