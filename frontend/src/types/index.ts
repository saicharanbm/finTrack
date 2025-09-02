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
export interface TransactionsQueryParams {
  range?: "week" | "month" | "3month" | "year" | "all";
  page?: number;
  pageSize?: number;
}

export interface UpdateTransactionSchema {
  title?: string;
  amountPaise?: string;
  category?: CategoriesType;
  type?: TransactionsType;
  date?: string;
}

export type TransactionType = Omit<
  TransactionSchemaType,
  "amountPaise" | "date"
> & {
  id: string;
  amountPaise: string; // Keep as string since BigInt becomes string in JSON
  date: string;
};
