import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthData, UserDto } from "@eventsphere/shared";
import { onSessionChange, refreshSession, setAccessToken } from "@/api/core";

export type AuthStatus = "loading" | "authenticated" | "guest";

interface AuthContextValue {
  user: UserDto | null;
  status: AuthStatus;
  /** Store a session returned by the login/register data-layer hooks. */
  applySession: (data: AuthData) => void;
  /** Drop the local session (after the logout mutation settles). */
  clearSession: () => void;
  setUser: (user: UserDto) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<UserDto | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  // Restore the session from the refresh cookie on first load (docs/05 §2)
  useEffect(() => {
    let cancelled = false;
    refreshSession()
      .then((data) => {
        if (cancelled) return;
        setUserState(data.user);
        setStatus("authenticated");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("guest");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Background refresh failures (revoked session) log the user out everywhere
  useEffect(() => {
    return onSessionChange((nextUser) => {
      setUserState(nextUser);
      setStatus(nextUser ? "authenticated" : "guest");
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      applySession(data) {
        setAccessToken(data.accessToken);
        setUserState(data.user);
        setStatus("authenticated");
      },
      clearSession() {
        setAccessToken(null);
        setUserState(null);
        setStatus("guest");
      },
      setUser(next) {
        setUserState(next);
      },
    }),
    [user, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function roleHome(role: UserDto["role"]): string {
  switch (role) {
    case "super_admin":
      return "/admin";
    case "organizer":
      return "/organizer";
    default:
      return "/";
  }
}
