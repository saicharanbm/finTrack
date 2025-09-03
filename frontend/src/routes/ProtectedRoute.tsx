import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import AuthVerificationLoader from "@/components/shimmer/AuthVerificationLoader";
import Container from "@/components/Container";
import { queryClient } from "@/main";

export default function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  const cachedAuth = queryClient.getQueryData(["auth", "user"]);

  if (isLoading) return <AuthVerificationLoader />;
  if (isAuthenticated || cachedAuth)
    return (
      <Container>
        <Outlet />
      </Container>
    );
  return <Navigate to="/" replace state={{ from: location }} />;
}
