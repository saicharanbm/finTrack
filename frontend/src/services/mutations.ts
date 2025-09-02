import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import {
  axiosInstance,
  createBulkTransaction,
  createTransaction,
  deleteTransaction,
  getParsedTransaction,
  updateTransaction,
  userGoogleLogin,
  userLogout,
} from "./api";
import { queryClient } from "@/main";
import type { TransactionSchemaType, UpdateTransactionSchema } from "@/types";

export const useGoogleLoginMutation = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      try {
        const response = await userGoogleLogin(code);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          // Throw the server's error message
          throw {
            message:
              error.response.data?.message || "An unknown error occurred",
          };
        }
        // For non-Axios errors
        throw { message: "An unexpected error occurred" };
      }
    },
    onSuccess: (data: {
      accessToken: string;
      user: { id: string; email: string; name: string; profilePic: string };
    }) => {
      const { accessToken: token, user } = data;
      // add the access token to axios instance headers
      axiosInstance.defaults.headers.authorization = `Bearer ${token}`;

      queryClient.setQueryData(["auth", "user"], user);
    },
  });
};

export const useParsedTransactions = () => {
  return useMutation({
    mutationFn: async (message: string) => {
      try {
        const response = await getParsedTransaction(message);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          // Throw the server's error message
          throw {
            message:
              error.response.data?.message || "An unknown error occurred",
          };
        }
        // For non-Axios errors
        throw { message: "An unexpected error occurred" };
      }
    },
  });
};

export const useUpdateTransactions = () => {
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTransactionSchema;
    }) => {
      try {
        const res = await updateTransaction(id, data);
        return res.data; // server returns updated transaction object
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw {
            message:
              error.response.data?.message || "An unknown error occurred",
          };
        }
        throw { message: "An unexpected error occurred" };
      }
    },
    onSuccess: () => {
      // refresh the list
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useDeleteTransactions = () => {
  return useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      try {
        const res = await deleteTransaction(id);
        // 204 No Content -> res.data is undefined; treat any 2xx as success
        return res.status;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          throw {
            message:
              error.response.data?.message || "An unknown error occurred",
          };
        }
        throw { message: "An unexpected error occurred" };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
};

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: async () => {
      try {
        const response = await userLogout();
        return response.data.message;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          // Throw the server's error message
          throw {
            message:
              error.response.data?.message || "An unknown error occurred",
          };
        }
        // For non-Axios errors
        throw { message: "An unexpected error occurred" };
      }
    },
    onSuccess: () => {
      //clear the query cache
      queryClient.clear();
      //clear the axios instance auth headers
      axiosInstance.defaults.headers.authorization = "";
    },
  });
};

export const useCreateTransactionMutation = () => {
  return useMutation({
    mutationFn: async (
      data: TransactionSchemaType | TransactionSchemaType[]
    ) => {
      try {
        const response = Array.isArray(data)
          ? await createBulkTransaction(data)
          : await createTransaction(data);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          // Throw the server's error message
          throw {
            message:
              error.response.data?.message || "An unknown error occurred",
          };
        }
        // For non-Axios errors
        throw { message: "An unexpected error occurred" };
      }
    },
  });
};
