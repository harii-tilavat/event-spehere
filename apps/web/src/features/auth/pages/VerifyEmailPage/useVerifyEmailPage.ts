import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useVerifyEmail } from "@/api";
import { getErrorMessage } from "@/api/core";
import { useAuth } from "@/context/AuthContext";
import type { VerifyState } from "./types";

export function useVerifyEmailPage() {
  const [params] = useSearchParams();
  const { user, setUser } = useAuth();
  const [state, setState] = useState<VerifyState>({ phase: "verifying" });
  const startedRef = useRef(false);
  const token = params.get("token") ?? "";

  const verifyEmail = useVerifyEmail({
    onSuccess: ({ user: verified }) => {
      setState({ phase: "done" });
      if (user && user.id === verified.id) setUser(verified);
    },
    onError: (err) => setState({ phase: "error", message: getErrorMessage(err) }),
  });
  const verifyMutate = verifyEmail.mutate;

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (!token) {
      setState({ phase: "error", message: "This verification link is missing its token" });
      return;
    }
    verifyMutate(token);
  }, [token, verifyMutate]);

  return { state, isLoggedIn: !!user };
}
