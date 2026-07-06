import { z } from "zod";

/** Validation rules per docs/06 §5 — single source for web and api. */
export const emailSchema = z.string().trim().toLowerCase().email("Invalid email");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/\d/, "Password must contain a digit");

export const nameSchema = z.string().trim().min(2, "Name is too short").max(100, "Name is too long");

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    role: z.enum(["attendee", "organizer"]),
    organizationName: z.string().trim().min(2).max(150).optional(),
  })
  .refine((v) => v.role !== "organizer" || !!v.organizationName, {
    path: ["organizationName"],
    message: "Organization name is required for organizers",
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;
