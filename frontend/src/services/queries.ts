import { useQuery } from "@tanstack/react-query";
import { getTransactions, getUserData } from "./api";
import type { TransactionsQueryParams } from "@/types";
export const useAuthQuery = () => {
  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      const response = await getUserData();
      return response.data;
    },

    retry: false,
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
    staleTime: 5 * 60 * 1000,
  });
};
