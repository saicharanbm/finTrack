import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { axiosInstance, getParsedTransaction, userGoogleLogin } from "./api";
import { queryClient } from "@/main";

export const useGoogleLoginMutation = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      try {
        const response = await userGoogleLogin(code);
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          // Throw the server's error message
          throw error.response.data?.message || "An unknown error occurred";
        }
        // For non-Axios errors
        throw "An unexpected error occurred";
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
          throw error.response.data?.message || "An unknown error occurred";
        }
        // For non-Axios errors
        throw "An unexpected error occurred";
      }
    },
  });
};
