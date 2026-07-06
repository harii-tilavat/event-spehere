import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLogout } from "@/api";
import { useAuth, roleHome } from "@/context/AuthContext";

export function usePublicLayout() {
  const { user, status, clearSession } = useAuth();
  const navigate = useNavigate();

  const logout = useLogout({
    onSettled: () => {
      clearSession();
      toast.success("Logged out");
      navigate("/", { replace: true });
    },
  });

  return {
    user,
    isAuthenticated: status === "authenticated" && !!user,
    dashboardPath: user ? (user.role === "attendee" ? "/account" : roleHome(user.role)) : "/",
    isLoggingOut: logout.isPending,
    handleLogout: () => logout.mutate(),
  };
}
