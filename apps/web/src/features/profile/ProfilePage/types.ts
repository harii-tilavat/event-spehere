import { z } from "zod";
import { nameSchema, passwordSchema, phoneSchema } from "@eventsphere/shared";

export const profileFormSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
});
export type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const changePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });
export type ChangePasswordFormValues = z.infer<typeof changePasswordFormSchema>;

export const organizerProfileFormSchema = z.object({
  organizationName: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional(),
  website: z.string().url().max(255).optional().or(z.literal("")),
});
export type OrganizerProfileFormValues = z.infer<typeof organizerProfileFormSchema>;
