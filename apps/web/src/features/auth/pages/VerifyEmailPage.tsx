import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { errorMessage } from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import { verifyEmail } from "../api/auth.api";
import { AuthCard } from "../components/AuthCard";
import { Button } from "@/components/ui/button";

type VerifyState = { phase: "verifying" } | { phase: "done" } | { phase: "error"; message: string };

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const { user, setUser } = useAuth();
  const [state, setState] = useState<VerifyState>({ phase: "verifying" });
  const started = useRef(false);
  const token = params.get("token") ?? "";

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!token) {
      setState({ phase: "error", message: "This verification link is missing its token" });
      return;
    }
    verifyEmail(token)
      .then(({ user: verified }) => {
        setState({ phase: "done" });
        if (user && user.id === verified.id) setUser(verified);
      })
      .catch((err) => setState({ phase: "error", message: errorMessage(err) }));
  }, [token, user, setUser]);

  return (
    <AuthCard title="Email verification">
      {state.phase === "verifying" && <p className="text-sm text-muted-foreground">Verifying your email…</p>}
      {state.phase === "done" && (
        <div className="space-y-4">
          <p className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-5 text-success" /> Your email is verified. You can now book tickets.
          </p>
          <Button asChild className="w-full">
            <Link to={user ? "/" : "/login"}>{user ? "Browse events" : "Log in"}</Link>
          </Button>
        </div>
      )}
      {state.phase === "error" && (
        <div className="space-y-4">
          <p className="flex items-center gap-2 text-sm">
            <XCircle className="size-5 text-destructive" /> {state.message}
          </p>
          <p className="text-sm text-muted-foreground">
            Log in and request a new verification email from your dashboard.
          </p>
        </div>
      )}
    </AuthCard>
  );
}
