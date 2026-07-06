import { Link } from "react-router-dom";
import { Button, FormField, Input, cn } from "@eventsphere/ui";
import { AuthCard } from "../../components";
import { useRegisterPage } from "./useRegisterPage";

export function RegisterPage() {
  const { form, errors, isSubmitting, selectedRole, selectRole, handleSubmit } = useRegisterPage();

  return (
    <AuthCard
      title="Create your account"
      description="Book events as an attendee, or apply to organize your own"
      footer={
        <>
          Already have an account?{" "}
          <Link className="text-foreground underline underline-offset-4" to="/login">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-2">
          {(["attendee", "organizer"] as const).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => selectRole(role)}
              className={cn(
                "rounded-md border px-3 py-2 text-sm capitalize transition-colors",
                selectedRole === role ? "border-primary bg-secondary font-medium" : "border-input text-muted-foreground",
              )}
            >
              {role}
            </button>
          ))}
        </div>

        <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" {...form.register("name")} />
        </FormField>

        {selectedRole === "organizer" && (
          <FormField
            label="Organization name"
            htmlFor="organizationName"
            error={errors.organizationName?.message}
            hint="Your application is reviewed by an admin before you can publish events"
          >
            <Input id="organizationName" {...form.register("organizationName")} />
          </FormField>
        )}

        <FormField label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        </FormField>
        <FormField
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          hint="At least 8 characters with an uppercase letter and a digit"
        >
          <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
        </FormField>
        <FormField label="Confirm password" htmlFor="confirmPassword" error={errors.confirmPassword?.message}>
          <Input id="confirmPassword" type="password" autoComplete="new-password" {...form.register("confirmPassword")} />
        </FormField>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </AuthCard>
  );
}
