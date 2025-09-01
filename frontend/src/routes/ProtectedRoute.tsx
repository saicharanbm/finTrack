import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "@/hooks/useAuth";
import AuthVerificationLoader from "@/components/shimmer/AuthVerificationLoader";
import Container from "@/components/Container";

export default function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) return <AuthVerificationLoader />;
  if (!isAuthenticated)
    return <Navigate to="/" replace state={{ from: location }} />;

  return (
    <Container>
      <Outlet />
    </Container>
  );
}
