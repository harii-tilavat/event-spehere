import { z } from "zod";
import { registerSchema } from "@eventsphere/shared";

export const registerFormSchema = registerSchema
  .and(z.object({ confirmPassword: z.string() }))
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
