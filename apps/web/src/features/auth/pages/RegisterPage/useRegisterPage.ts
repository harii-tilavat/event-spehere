import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useRegister } from "@/api";
import { getErrorMessage } from "@/api/core";
import { useAuth, roleHome } from "@/context/AuthContext";
import { registerFormSchema, type RegisterFormValues } from "./types";

export function useRegisterPage() {
  const { applySession } = useAuth();
  const navigate = useNavigate();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { role: "attendee" },
  });

  const register = useRegister({
    onSuccess: (session) => {
      applySession(session);
      toast.success("Account created — check your email for a verification link");
      navigate(roleHome(session.user.role), { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return {
    form,
    errors: form.formState.errors,
    isSubmitting: register.isPending,
    selectedRole: form.watch("role"),
    selectRole: (role: "attendee" | "organizer") => form.setValue("role", role),
    handleSubmit: form.handleSubmit((values) =>
      register.mutate({
        name: values.name,
        email: values.email,
        password: values.password,
        role: values.role,
        organizationName: values.organizationName,
      }),
    ),
  };
}
