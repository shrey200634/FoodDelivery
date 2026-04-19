import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import SkeletonPage from "./SkeletonPage";

function normaliseRole(role = "") {
  const r = (role || "").toUpperCase();
  if (r.includes("OWNER") || r.includes("RESTAURANT")) return "RESTAURANT_OWNER";
  if (r.includes("DRIVER") || r.includes("DELIVERY"))   return "DRIVER";
  return "CUSTOMER";
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { token, user, fetchProfile } = useAuthStore();
  const location = useLocation();
  const [checking, setChecking] = useState(!user && !!token);

  useEffect(() => {
    if (token && !user) {
      fetchProfile().catch(() => {}).finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [token]);

  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  if (checking) return <SkeletonPage />;

  if (allowedRoles && user) {
    const role    = normaliseRole(user.role);
    const allowed = allowedRoles.some(r => normaliseRole(r) === role);
    if (!allowed) {
      if (role === "RESTAURANT_OWNER") return <Navigate to="/owner" replace />;
      if (role === "DRIVER")           return <Navigate to="/driver" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
