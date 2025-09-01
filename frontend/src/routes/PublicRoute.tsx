// routes/PublicRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import AuthVerificationLoader from "@/components/shimmer/AuthVerificationLoader";

export default function PublicRoute() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <AuthVerificationLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
