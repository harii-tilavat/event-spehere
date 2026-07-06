import { Link } from "react-router-dom";
import { Button, FormField, Input } from "@eventsphere/ui";
import { AuthCard } from "../../components";
import { useLoginPage } from "./useLoginPage";

export function LoginPage() {
  const { form, errors, isSubmitting, handleSubmit } = useLoginPage();

  return (
    <AuthCard
      title="Log in"
      description="Welcome back — enter your credentials"
      footer={
        <>
          New to EventSphere?{" "}
          <Link className="text-foreground underline underline-offset-4" to="/register">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        </FormField>
        <FormField label="Password" htmlFor="password" error={errors.password?.message}>
          <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
        </FormField>
        <div className="flex items-center justify-between">
          <Link to="/forgot-password" className="text-xs text-muted-foreground underline underline-offset-4">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Logging in…" : "Log in"}
        </Button>
      </form>
    </AuthCard>
  );
}
