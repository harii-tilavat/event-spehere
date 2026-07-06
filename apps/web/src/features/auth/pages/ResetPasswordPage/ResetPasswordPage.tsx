import { Link } from "react-router-dom";
import { Button, FormField, Input } from "@eventsphere/ui";
import { AuthCard } from "../../components";
import { useResetPasswordPage } from "./useResetPasswordPage";

export function ResetPasswordPage() {
  const { form, errors, isSubmitting, hasToken, handleSubmit } = useResetPasswordPage();

  if (!hasToken) {
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
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
