import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { passwordSchema } from "@eventsphere/shared";
import { errorMessage } from "@/lib/axios";
import { resetPassword } from "../api/auth.api";
import { AuthCard } from "../components/AuthCard";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const resetFormSchema = z
  .object({ newPassword: passwordSchema, confirmPassword: z.string() })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ResetFormValues = z.infer<typeof resetFormSchema>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") ?? "";

  const form = useForm<ResetFormValues>({ resolver: zodResolver(resetFormSchema) });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async ({ newPassword }) => {
    try {
      const { message } = await resetPassword(token, newPassword);
      toast.success(message);
      navigate("/login", { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

  if (!token) {
    return (
      <AuthCard title="Invalid link" description="This reset link is missing its token">
        <Link className="text-sm underline underline-offset-4" to="/forgot-password">
          Request a new link
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Reset password" description="Choose a new password for your account">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <FormField
          label="New password"
          htmlFor="newPassword"
          error={errors.newPassword?.message}
          hint="At least 8 characters with an uppercase letter and a digit"
        >
          <Input id="newPassword" type="password" autoComplete="new-password" {...form.register("newPassword")} />
        </FormField>
        <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...form.register("confirmPassword")} />
        </FormField>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Resetting…" : "Reset password"}
        </Button>
      </form>
    </AuthCard>
  );
}
