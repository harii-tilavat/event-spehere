import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { registerSchema } from "@eventsphere/shared";
import { errorMessage } from "@/lib/axios";
import { useAuth, roleHome } from "@/context/AuthContext";
import { AuthCard } from "../components/AuthCard";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const registerFormSchema = registerSchema
  .and(z.object({ confirmPassword: z.string() }))
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type RegisterFormValues = z.infer<typeof registerFormSchema>;

export function RegisterPage() {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { role: "attendee" },
  });
  const { errors, isSubmitting } = form.formState;
  const role = form.watch("role");

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const user = await registerAccount({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        organizationName: values.organizationName,
      });
      toast.success("Account created — check your email for a verification link");
      navigate(roleHome(user.role), { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

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
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-2">
          {(["attendee", "organizer"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => form.setValue("role", r)}
              className={cn(
                "rounded-md border px-3 py-2 text-sm capitalize transition-colors",
                role === r ? "border-primary bg-secondary font-medium" : "border-input text-muted-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <FormField label="Full name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" autoComplete="name" {...form.register("name")} />
        </FormField>

        {role === "organizer" && (
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
