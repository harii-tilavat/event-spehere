import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { forgotPasswordSchema } from "@eventsphere/shared";
import { useForgotPassword } from "@/api";
import type { ForgotPasswordFormValues } from "./types";

export function useForgotPasswordPage() {
  const [isSent, setIsSent] = useState(false);
  const form = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  const forgotPassword = useForgotPassword({
    onSuccess: ({ message }) => {
      toast.success(message);
      setIsSent(true);
    },
  });

  return {
    form,
    errors: form.formState.errors,
    isSubmitting: forgotPassword.isPending,
    isSent,
    handleSubmit: form.handleSubmit(({ email }) => forgotPassword.mutate(email)),
  };
}
