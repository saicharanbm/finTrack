// hooks/useAuth.ts
import { useAuthQuery } from "@/services/queries";

export default function useAuth() {
  const { data: userData, isLoading, isError } = useAuthQuery();
  return { isLoading, isAuthenticated: !!userData, isError };
}
