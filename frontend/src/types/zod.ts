import z from "zod";
export const CategorySchema = z.enum([
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

export const SuccessTransactionDataSchema = z
  .array(TransactionDataSchema)
  .min(1);

export const SuccessTransactionSchema = z.object({
  type: z.literal("success"),
  data: SuccessTransactionDataSchema,
});
export const IncompleteTransactionSchema = z.object({
  type: z.literal("incomplete"),
  message: z.string().min(1),
});
