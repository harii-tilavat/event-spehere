import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useResetPassword } from "@/api";
import { resetFormSchema, type ResetFormValues } from "./types";

export function useResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";

  const form = useForm<ResetFormValues>({ resolver: zodResolver(resetFormSchema) });

  const resetPassword = useResetPassword({
    onSuccess: ({ message }) => {
      toast.success(message);
      navigate("/login", { replace: true });
    },
  });

  return {
    form,
    errors: form.formState.errors,
    isSubmitting: resetPassword.isPending,
    hasToken: !!token,
    handleSubmit: form.handleSubmit(({ newPassword }) => resetPassword.mutate({ token, newPassword })),
  };
}
