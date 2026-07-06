import { Link, Outlet } from "react-router-dom";
import { CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <CalendarRange className="size-5 text-primary" />
            <span className="text-lg">EventSphere</span>
          </Link>
          <nav className="flex items-center gap-2">
            {/* Phase 1: real auth routes */}
            <Button variant="ghost" size="sm" disabled>
              Log in
            </Button>
            <Button size="sm" disabled>
              Sign up
            </Button>
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
