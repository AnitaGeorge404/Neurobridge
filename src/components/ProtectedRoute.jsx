import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * ProtectedRoute
 *
 * Usage:
 *   <ProtectedRoute>           — any authenticated user
 *   <ProtectedRoute role="admin"> — admin only
 *   <ProtectedRoute role="user">  — regular users only
 *
 * Redirect logic:
 *   - Not authenticated       → /login
 *   - Admin visiting /        → /admin
 *   - User visiting /admin    → /
 *   - Role mismatch           → their correct home
 */
export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, isLoading, user, role: userRole } = useAuth();
  const location = useLocation();

  // Still hydrating from localStorage – render nothing to avoid flash
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-muted-foreground text-sm animate-pulse">Loading…</span>
      </div>
    );
  }

  // Not logged in → go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role-specific guard
  if (role && userRole !== role) {
    if (userRole === "admin")    return <Navigate to="/admin" replace />;
    if (userRole === "guardian") return <Navigate to="/guardian-dashboard" replace />;
    if (userRole === "user") {
      const profile = user?.selectedProfile;
      return <Navigate to={profile ? `/${profile}` : "/"} replace />;
    }
  }

  return children;
}
