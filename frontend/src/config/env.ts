import { z } from "zod";

const Env = z.object({
  VITE_ENVIRONMENT: z
    .enum(["development", "test", "production"])
    .default("development"),
  VITE_BACKEND_URL_DEV: z.string().url(),
  VITE_BACKEND_URL_PROD: z.string().url(),
  VITE_GOOGLE_CLIENT_ID: z.string(),
});

export const env = Env.parse(import.meta.env);
