import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLogout, useResendVerification } from "@/api";
import { useAuth } from "@/context/AuthContext";
import { DASHBOARD_NAV } from "./const";

export function useDashboardLayout() {
  const { user, clearSession } = useAuth();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const logout = useLogout({
    onSettled: () => {
      clearSession();
      toast.success("Logged out");
      navigate("/", { replace: true });
    },
  });

  const resendVerification = useResendVerification({
    onSuccess: ({ message }) => toast.success(message),
  });

  return {
    user,
    navItems: user ? DASHBOARD_NAV[user.role] : [],
    isMobileNavOpen,
    isLoggingOut: logout.isPending,
    isResending: resendVerification.isPending,
    openMobileNav: () => setIsMobileNavOpen(true),
    closeMobileNav: () => setIsMobileNavOpen(false),
    handleLogout: () => logout.mutate(),
    handleResendVerification: () => resendVerification.mutate(),
  };
}
