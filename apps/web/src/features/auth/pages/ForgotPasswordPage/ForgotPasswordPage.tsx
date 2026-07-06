import { Link } from "react-router-dom";
import { Button, FormField, Input } from "@eventsphere/ui";
import { AuthCard } from "../../components";
import { useForgotPasswordPage } from "./useForgotPasswordPage";

export function ForgotPasswordPage() {
  const { form, errors, isSubmitting, isSent, handleSubmit } = useForgotPasswordPage();

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
      {isSent ? (
        <p className="text-sm text-muted-foreground">
          If an account exists for that email, a reset link is on its way. The link expires in 1 hour.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
