import { z } from "zod";
import { paginationQuerySchema } from "./common.schema.js";

export const userListQuerySchema = paginationQuerySchema.extend({
  role: z.enum(["super_admin", "organizer", "attendee"]).optional(),
  status: z.enum(["active", "suspended"]).optional(),
});
export type UserListQuery = z.infer<typeof userListQuerySchema>;

export const userStatusSchema = z.object({
  status: z.enum(["active", "suspended"]),
});
export type UserStatusInput = z.infer<typeof userStatusSchema>;

export const organizerListQuerySchema = paginationQuerySchema.extend({
  approvalStatus: z.enum(["pending", "approved", "rejected"]).optional(),
});
export type OrganizerListQuery = z.infer<typeof organizerListQuerySchema>;

export const organizerDecisionSchema = z
  .object({
    action: z.enum(["approve", "reject"]),
    reason: z.string().trim().max(500).optional(),
  })
  .refine((v) => v.action !== "reject" || !!v.reason, {
    path: ["reason"],
    message: "A reason is required when rejecting",
  });
export type OrganizerDecisionInput = z.infer<typeof organizerDecisionSchema>;

export const organizerProfileUpdateSchema = z.object({
  organizationName: z.string().trim().min(2).max(150).optional(),
  description: z.string().trim().max(2000).optional().nullable(),
  website: z.string().url().max(255).optional().nullable().or(z.literal("").transform(() => null)),
  logoUrl: z.string().url().max(500).optional().nullable(),
});
export type OrganizerProfileUpdateInput = z.infer<typeof organizerProfileUpdateSchema>;
