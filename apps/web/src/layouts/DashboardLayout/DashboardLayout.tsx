import { Link, NavLink, Outlet } from "react-router-dom";
import { CalendarRange, LogOut, Menu, X } from "lucide-react";
import { Badge, Button, cn } from "@eventsphere/ui";
import { useDashboardLayout } from "./useDashboardLayout";

export function DashboardLayout() {
  const {
    user,
    navItems,
    isMobileNavOpen,
    isLoggingOut,
    isResending,
    openMobileNav,
    closeMobileNav,
    handleLogout,
    handleResendVerification,
  } = useDashboardLayout();

  if (!user) return null; // RequireAuth guarantees a user; satisfies the type checker

  const sidebar = (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={closeMobileNav}
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
      <aside className="hidden w-60 shrink-0 border-r bg-card/40 lg:block">
        <div className="flex h-16 items-center gap-2 border-b px-5 font-semibold">
          <CalendarRange className="size-5 text-primary" />
          <Link to="/">EventSphere</Link>
        </div>
        {sidebar}
      </aside>

      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={closeMobileNav} />
          <aside className="absolute inset-y-0 left-0 w-64 border-r bg-card">
            <div className="flex h-16 items-center justify-between border-b px-4 font-semibold">
              <span className="flex items-center gap-2">
                <CalendarRange className="size-5 text-primary" /> EventSphere
              </span>
              <Button variant="ghost" size="icon" onClick={closeMobileNav}>
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
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={openMobileNav}>
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
            <Button variant="outline" size="sm" onClick={handleLogout} disabled={isLoggingOut}>
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
            <Button variant="outline" size="sm" onClick={handleResendVerification} disabled={isResending}>
              {isResending ? "Sending…" : "Resend verification email"}
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
