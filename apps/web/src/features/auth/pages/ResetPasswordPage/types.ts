import { z } from "zod";
import { passwordSchema } from "@eventsphere/shared";

export const resetFormSchema = z
  .object({ newPassword: passwordSchema, confirmPassword: z.string() })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type ResetFormValues = z.infer<typeof resetFormSchema>;
