import z from "zod";
import type {
  CategorySchema,
  IncompleteTransactionSchema,
  SuccessTransactionSchema,
  TransactionDataSchema,
  TransactionTypeSchema,
} from "./zod";
export type SuccessParseSchemaType = z.infer<typeof SuccessTransactionSchema>;
export type TransactionSchemaType = z.infer<typeof TransactionDataSchema>;
export type IncompleteParseSchemaType = z.infer<
  typeof IncompleteTransactionSchema
>;
export type CategoriesType = z.infer<typeof CategorySchema>;
export type TransactionsType = z.infer<typeof TransactionTypeSchema>;
