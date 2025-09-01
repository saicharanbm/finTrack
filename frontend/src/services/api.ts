import axios from "axios";
import { queryClient } from "../main";
import { env } from "@/config/env";

const baseURL =
  env.VITE_ENVIRONMENT === "production"
    ? env.VITE_BACKEND_URL_PROD
    : env.VITE_BACKEND_URL_DEV;

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Correct way to include cookies
});

axiosInstance.interceptors.response.use(
  (response) => response, // Return response for successful requests
  async (error) => {
    const originalRequest = error.config;
    console.log(error.response?.data);
    console.log("hello", error);

    // Check for 401 status and specific error message
    if (
      error.response?.status === 401 &&
      !originalRequest._retry // Ensure no infinite loops
    ) {
      console.log("Token expired. Attempting refresh...");
      //if the original fails again we and directly return the error.
      originalRequest._retry = true;

      try {
        const refreshAxios = axios.create({
          baseURL: axiosInstance.defaults.baseURL,
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        });

        const refreshResponse = await refreshAxios.post("/auth/refresh");
        const newAccessToken = refreshResponse.data.accessToken;

        // Update global axios instance and the original request with the new token
        axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest); // Retry original request
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);

        // Clear cached user data and redirect to login
        queryClient.setQueryData(["auth", "user"], null);
        throw refreshError; // Re-throw to propagate the error
      }
    }

    // Reject other errors
    return Promise.reject(error);
  }
);

export const userGoogleLogin = async (code: string) => {
  return axiosInstance.post("/auth/google", { code });
};

export const getUserData = () => {
  return axiosInstance.get("/auth/profile");
};

export const getParsedTransaction = (message: string) => {
  return axiosInstance.post("/api/transactions/parse", { message });
};
