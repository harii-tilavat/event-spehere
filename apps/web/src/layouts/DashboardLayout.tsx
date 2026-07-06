import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { CalendarRange, LogOut, Menu, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { dashboardNav } from "@/layouts/dashboard-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { resendVerification } from "@/features/auth/api/auth.api";
import { errorMessage } from "@/lib/axios";
import { cn } from "@/lib/utils";

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null; // RequireAuth guarantees a user; satisfies the type checker

  const items = dashboardNav[user.role];

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/", { replace: true });
  };

  const handleResend = async () => {
    try {
      const { message } = await resendVerification();
      toast.success(message);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  const sidebar = (
    <nav className="flex flex-col gap-1 p-3">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              isActive ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-secondary/50",
            )
          }
        >
          <Icon className="size-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r bg-card/40 lg:block">
        <div className="flex h-16 items-center gap-2 border-b px-5 font-semibold">
          <CalendarRange className="size-5 text-primary" />
          <Link to="/">EventSphere</Link>
        </div>
        {sidebar}
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r bg-card">
            <div className="flex h-16 items-center justify-between border-b px-4 font-semibold">
              <span className="flex items-center gap-2">
                <CalendarRange className="size-5 text-primary" /> EventSphere
              </span>
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="size-5" />
            </Button>
            <div>
              <p className="text-sm font-medium leading-tight">{user.name}</p>
              <p className="text-xs capitalize text-muted-foreground">{user.role.replace("_", " ")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/events">Browse events</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-4" /> Log out
            </Button>
          </div>
        </header>

        {!user.isEmailVerified && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm sm:px-6">
            <span>
              <Badge variant="outline" className="mr-2 border-yellow-500/50 text-yellow-500">
                Unverified
              </Badge>
              Verify your email to book tickets and create events.
            </span>
            <Button variant="outline" size="sm" onClick={handleResend}>
              Resend verification email
            </Button>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
