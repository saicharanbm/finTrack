// routes/PublicRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "@/hooks/useAuth";

export default function PublicRoute() {
  const { isAuthenticated } = useAuth();

  // if (isLoading) return <AuthVerificationLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return <Outlet />;
}
