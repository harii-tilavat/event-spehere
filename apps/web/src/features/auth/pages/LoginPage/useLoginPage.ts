import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { loginSchema } from "@eventsphere/shared";
import { useLogin } from "@/api";
import { getErrorMessage } from "@/api/core";
import { useAuth, roleHome } from "@/context/AuthContext";
import type { LoginFormValues } from "./types";

function safeRedirect(target: string | null): string | null {
  return target && target.startsWith("/") && !target.startsWith("//") ? target : null;
}

export function useLoginPage() {
  const { applySession } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const form = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });
  const login = useLogin({
    onSuccess: (session) => {
      applySession(session);
      toast.success(`Welcome back, ${session.user.name}`);
      navigate(safeRedirect(params.get("redirect")) ?? roleHome(session.user.role), { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return {
    form,
    errors: form.formState.errors,
    isSubmitting: login.isPending,
    handleSubmit: form.handleSubmit((values) => login.mutate(values)),
  };
}
