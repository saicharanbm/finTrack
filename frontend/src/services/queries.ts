import { useQuery } from "@tanstack/react-query";
import {
  getTransactions,
  getTransactionsByCategories,
  getTransactionsSummary,
  getTransactionsTrends,
  getUserData,
} from "./api";
import type { RangeKey, TransactionsQueryParams } from "@/types";
export const useAuthQuery = () => {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const response = await getUserData();
      return response.data;
    },
    retry: 3,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};

export const useTransactionsQuery = (params: TransactionsQueryParams = {}) => {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: async () => {
      const { data } = await getTransactions(params);
      return data; // { range, page, pageSize, total, items }
    },
  });
};
export const useTransactionsSummary = (params: RangeKey = "all") => {
  return useQuery({
    queryKey: ["transactions", "analytics", "summary", params],
    queryFn: async () => {
      const { data } = await getTransactionsSummary(params);
      return data; // {  range,totalIncomePaise,totalExpensePaise,savingsPaise }
    },
  });
};
export const useTransactionsByCategory = (params: RangeKey = "all") => {
  return useQuery({
    queryKey: ["transactions", "analytics", "category", params],
    queryFn: async () => {
      const { data } = await getTransactionsByCategories(params);
      return data; // { range,totalExpensePaise,items, }
    },
  });
};

export const useTransactionsTrends = (params: RangeKey = "all") => {
  return useQuery({
    queryKey: ["transactions", "analytics", "trends", params],
    queryFn: async () => {
      const { data } = await getTransactionsTrends(params);
      return data; // { range, bucket, points }
    },
  });
};
