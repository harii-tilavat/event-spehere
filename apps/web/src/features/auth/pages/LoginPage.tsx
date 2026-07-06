import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@eventsphere/shared";
import { errorMessage } from "@/lib/axios";
import { useAuth, roleHome } from "@/context/AuthContext";
import { AuthCard } from "../components/AuthCard";
import { FormField } from "@/components/shared/FormField";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function safeRedirect(target: string | null): string | null {
  return target && target.startsWith("/") && !target.startsWith("//") ? target : null;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const form = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const { errors, isSubmitting } = form.formState;

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name}`);
      navigate(safeRedirect(params.get("redirect")) ?? roleHome(user.role), { replace: true });
    } catch (err) {
      toast.error(errorMessage(err));
    }
  });

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
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
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
