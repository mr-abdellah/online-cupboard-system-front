import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { removeToken } from "@/utils/token";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    removeToken();
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
