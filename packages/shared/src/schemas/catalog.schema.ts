import { z } from "zod";

// Categories (docs/03 §2.4)
export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional().nullable(),
  imageUrl: z.string().url().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
});
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;

export const categoryUpdateSchema = categoryCreateSchema.partial();
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

// Venues (docs/03 §2.5)
export const venueCreateSchema = z.object({
  name: z.string().trim().min(2).max(150),
  addressLine: z.string().trim().min(5).max(255),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Pincode must be 6 digits")
    .optional()
    .nullable()
    .or(z.literal("").transform(() => null)),
  capacity: z.coerce.number().int().min(1).max(1_000_000),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
  facilities: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  images: z.array(z.string().url().max(500)).max(6).default([]),
});
export type VenueCreateInput = z.infer<typeof venueCreateSchema>;

export const venueUpdateSchema = venueCreateSchema.partial();
export type VenueUpdateInput = z.infer<typeof venueUpdateSchema>;
