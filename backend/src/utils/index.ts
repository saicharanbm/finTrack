import jwt from "jsonwebtoken";
import { TokenType } from "../types";

export const generateToken = (
  userId: string,
  tokenType: TokenType,
  secret: string
): string => {
  const expiresIn = tokenType === "access" ? "10m" : "7d";

  return jwt.sign({ userId, type: tokenType }, secret, {
    expiresIn,
  });
};
