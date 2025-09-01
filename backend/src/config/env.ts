import { z } from "zod";
import "dotenv/config";

const Env = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.string().default("4000"),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  FRONTEND_URL_DEV: z.string().url(),
  FRONTEND_URL_PROD: z.string().url(),
  OPENAI_API_KEY: z.string(),
});

export const env = Env.parse(process.env);
