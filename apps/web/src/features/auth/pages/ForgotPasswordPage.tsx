import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@eventsphere/shared";
import { errorMessage } from "@/lib/axios";
import { forgotPassword } from "../api/auth.api";
import { AuthCard } from "../components/AuthCard";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async ({ email }) => {
    try {
      const { message } = await forgotPassword(email);
      toast.success(message);
      setSent(true);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  return (
    <AuthCard
      title="Forgot password"
      description="We'll email you a link to reset it"
      footer={
        <Link className="text-foreground underline underline-offset-4" to="/login">
          Back to log in
        </Link>
      }
    >
      {sent ? (
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, a reset link is on its way. The link expires in 1 hour.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField label="Email" htmlFor="email" error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          </FormField>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
