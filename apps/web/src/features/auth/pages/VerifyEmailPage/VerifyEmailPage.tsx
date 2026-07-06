import { Link } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@eventsphere/ui";
import { AuthCard } from "../../components";
import { useVerifyEmailPage } from "./useVerifyEmailPage";

export function VerifyEmailPage() {
  const { state, isLoggedIn } = useVerifyEmailPage();

  return (
    <AuthCard title="Email verification">
      {state.phase === "verifying" && <p className="text-sm text-muted-foreground">Verifying your email…</p>}
      {state.phase === "done" && (
        <div className="space-y-4">
          <p className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="size-5 text-success" /> Your email is verified. You can now book tickets.
          </p>
          <Button asChild className="w-full">
            <Link to={isLoggedIn ? "/" : "/login"}>{isLoggedIn ? "Browse events" : "Log in"}</Link>
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
