import { Link, Outlet, useNavigate } from "react-router-dom";
import { CalendarRange, LayoutDashboard, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useAuth, roleHome } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function PublicLayout() {
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out");
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
              <CalendarRange className="size-5 text-primary" />
              <span className="text-lg">EventSphere</span>
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
              <Link to="/events" className="transition-colors hover:text-foreground">
                Browse events
              </Link>
            </nav>
          </div>
          <nav className="flex items-center gap-2">
            {status === "authenticated" && user ? (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={user.role === "attendee" ? "/account" : roleHome(user.role)}>
                    <LayoutDashboard className="size-4" /> Dashboard
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="size-4" /> Log out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Log in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Sign up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>EventSphere — Event Booking &amp; Management Platform</p>
          <p>MCA Capstone · LPU</p>
        </div>
      </footer>
    </div>
  );
}
