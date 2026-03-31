import { Navigate, useLocation } from "react-router-dom";
import { useUserAuth } from "../context/UserAuthContext.jsx";

export default function RequireUser({ children }) {
  const { isAuthenticated } = useUserAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
