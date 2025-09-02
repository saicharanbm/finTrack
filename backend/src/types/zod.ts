import { Category, TransactionType } from "@prisma/client";
import { z } from "zod4";
const CategorySchema = z.enum([
  "FOOD",
  "TRANSPORT",
  "ENTERTAINMENT",
  "SHOPPING",
  "UTILITIES",
  "HEALTHCARE",
  "EDUCATION",
  "TRAVEL",
  "GROCERIES",
  "RENT",
  "SALARY",
  "FREELANCE",
  "INVESTMENT",
  "GIFT",
  "OTHER",
]);

export const TransactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);

export const TransactionDataSchema = z
  .object({
    amountPaise: z.number().int().positive(),
    category: CategorySchema, // keep your existing enum
    type: TransactionTypeSchema, // keep your existing enum
    date: z
      .string()
      .regex(/^\d{2}\/\d{2}\/\d{4}$/)
      .optional()
      .nullable(),
    title: z.string().min(1, "title is required"),
  })
  .transform((t) => ({
    ...t,
    date: t.date ?? undefined, // normalize null → undefined
  }));

export const GetQuerySchema = z.object({
  range: z.enum(["week", "month", "3month", "year", "all"]).optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  pageSize: z.coerce.number().min(1).max(200).default(50).optional(),
});

type test = z.infer<typeof GetQuerySchema>;

export const UpdateTransactionSchema = z.object({
  title: z.string().min(1).optional(),
  amountPaise: z
    .union([z.string(), z.number(), z.bigint()])
    .transform((v) => BigInt(v as any))
    .optional(),
  category: z.nativeEnum(Category).optional(),
  type: z.nativeEnum(TransactionType).optional(),
  date: z
    .string()
    .regex(/^\d{2}\/\d{2}\/\d{4}$/)
    .optional()
    .nullable(),
});

export const TransactionsArraySchema = z.array(TransactionDataSchema).min(1);

export const TransactionResponseSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("success"),
    data: TransactionsArraySchema,
  }),
  z.object({
    type: z.literal("incomplete"),
    message: z.string().min(1),
  }),
]);

// Optional: normalize after parse (fill date= today if missing)
export function normalizeResponse(
  v: z.infer<typeof TransactionResponseSchema>
) {
  if (v.type === "success") {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const todayStr = `${dd}/${mm}/${yyyy}`;

    v.data = v.data.map((t) => ({ ...t, date: t.date ?? todayStr })); // keep provided date if present
  }
  return v;
}

// TypeScript types inferred from Zod schemas
// type Category = z.infer<typeof CategorySchema>;
// type TransactionType = z.infer<typeof TransactionTypeSchema>;
// type TransactionData = z.infer<typeof TransactionDataSchema>;
// type TransactionResponse = z.infer<typeof TransactionResponseSchema>;
