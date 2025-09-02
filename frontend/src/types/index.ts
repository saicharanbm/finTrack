import z from "zod";
import type {
  CategorySchema,
  IncompleteTransactionSchema,
  SuccessTransactionSchema,
  TransactionTypeSchema,
} from "./zod";
export type SuccessParseSchema = z.infer<typeof SuccessTransactionSchema>;
export type IncompleteParseSchema = z.infer<typeof IncompleteTransactionSchema>;
export type Categories = z.infer<typeof CategorySchema>;
export type Transactions = z.infer<typeof TransactionTypeSchema>;
