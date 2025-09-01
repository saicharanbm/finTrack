import { Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "../db/prisma.js";
import { env } from "../config/env.js";

export const verifyUser = async (
  req: Request,
  res: Response,
  next: Function
) => {
  const accessToken = req.headers.authorization?.split(" ")[1];
  if (!accessToken) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      env.JWT_ACCESS_SECRET
    ) as JwtPayload;
    // verify if the user exists
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
    });
    if (!user) {
      res.status(401).json({ message: "Unauthorized: User not found" });
      return;
    }
    // add the user id to the request object
    req.userId = user.id;
    next();
  } catch (error: any) {
    if (
      error instanceof jwt.JsonWebTokenError &&
      error.name === "TokenExpiredError"
    ) {
      res.status(401).json({ message: "Unauthorized: Token expired" });
      return;
    }
    res.status(401).json({ message: "Unauthorized: Invalid token" });
    return;
  }
};
