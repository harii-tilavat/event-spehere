import { Navigate, useLocation } from "react-router-dom";
import { useAuth, roleHome } from "@/context/AuthContext";
import type { RequireAuthProps } from "./types";

function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
    </div>
  );
}

/** UX-level route guard — real enforcement lives in the API (docs/02 §3). */
export function RequireAuth({ roles, children }: RequireAuthProps) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <FullPageSpinner />;
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={roleHome(user.role)} replace />;
  }
  return <>{children}</>;
}
