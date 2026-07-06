import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthData, LoginInput, UserDto } from "@eventsphere/shared";
import { api, refreshSession } from "@/lib/axios";
import { onSessionChange, setAccessToken } from "@/lib/auth-token";
import type { ApiSuccess } from "@eventsphere/shared";

export type AuthStatus = "loading" | "authenticated" | "guest";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "attendee" | "organizer";
  organizationName?: string;
}

interface AuthContextValue {
  user: UserDto | null;
  status: AuthStatus;
  login: (input: LoginInput) => Promise<UserDto>;
  register: (input: RegisterPayload) => Promise<UserDto>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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

  const value = useMemo<AuthContextValue>(() => {
    const applySession = (data: AuthData): UserDto => {
      setAccessToken(data.accessToken);
      setUserState(data.user);
      setStatus("authenticated");
      return data.user;
    };

    return {
      user,
      status,
      async login(input) {
        const res = await api.post<ApiSuccess<AuthData>>("/auth/login", input);
        return applySession(res.data.data);
      },
      async register(input) {
        const res = await api.post<ApiSuccess<AuthData>>("/auth/register", input);
        return applySession(res.data.data);
      },
      async logout() {
        try {
          await api.post("/auth/logout");
        } finally {
          setAccessToken(null);
          setUserState(null);
          setStatus("guest");
        }
      },
      async refreshUser() {
        const res = await api.get<ApiSuccess<{ user: UserDto }>>("/auth/me");
        setUserState(res.data.data.user);
      },
      setUser(next) {
        setUserState(next);
      },
    };
  }, [user, status]);

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
