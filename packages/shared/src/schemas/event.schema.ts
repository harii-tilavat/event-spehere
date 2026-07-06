import { z } from "zod";
import { paginationQuerySchema } from "./common.schema.js";

const isoDate = z.coerce.date();

export const eventCreateSchema = z
  .object({
    title: z.string().trim().min(5, "Title must be at least 5 characters").max(200),
    description: z.string().trim().min(20, "Description must be at least 20 characters").max(10_000),
    categoryId: z.coerce.number().int().positive(),
    venueId: z.coerce.number().int().positive(),
    bannerUrl: z.string().url().max(500).optional().nullable(),
    galleryImages: z.array(z.string().url().max(500)).max(6).default([]),
    startTime: isoDate,
    endTime: isoDate,
    registrationDeadline: isoDate,
    capacity: z.coerce.number().int().min(1),
  })
  .refine((v) => v.endTime > v.startTime, { path: ["endTime"], message: "End must be after start" })
  .refine((v) => v.registrationDeadline <= v.startTime, {
    path: ["registrationDeadline"],
    message: "Registration deadline must be on or before the start time",
  })
  .refine((v) => v.startTime > new Date(), { path: ["startTime"], message: "Start time must be in the future" });
export type EventCreateInput = z.infer<typeof eventCreateSchema>;

/** Edits allowed only in draft/rejected, so the same rules apply. */
export const eventUpdateSchema = eventCreateSchema;
export type EventUpdateInput = z.infer<typeof eventUpdateSchema>;

export const eventListQuerySchema = paginationQuerySchema.extend({
  categoryId: z.coerce.number().int().positive().optional(),
  city: z.string().trim().max(100).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  featured: z.coerce.boolean().optional(),
});
export type EventListQuery = z.infer<typeof eventListQuerySchema>;

export const eventStatusFilterSchema = paginationQuerySchema.extend({
  status: z.enum(["draft", "pending_approval", "rejected", "published", "cancelled", "completed"]).optional(),
});
export type EventStatusFilterQuery = z.infer<typeof eventStatusFilterSchema>;

export const eventRejectSchema = z.object({
  reason: z.string().trim().min(3, "A reason is required").max(500),
});
export type EventRejectInput = z.infer<typeof eventRejectSchema>;

export const ticketTypeCreateSchema = z
  .object({
    name: z.string().trim().min(2).max(100),
    description: z.string().trim().max(300).optional().nullable(),
    pricePaise: z.coerce.number().int().min(0, "Price cannot be negative"),
    quantityTotal: z.coerce.number().int().min(1),
    maxPerBooking: z.coerce.number().int().min(1).max(50).default(10),
    saleStart: z.coerce.date().optional().nullable(),
    saleEnd: z.coerce.date().optional().nullable(),
    isActive: z.boolean().default(true),
  })
  .refine((v) => !v.saleStart || !v.saleEnd || v.saleEnd > v.saleStart, {
    path: ["saleEnd"],
    message: "Sale end must be after sale start",
  });
export type TicketTypeCreateInput = z.infer<typeof ticketTypeCreateSchema>;

export const ticketTypeUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(300).optional().nullable(),
  pricePaise: z.coerce.number().int().min(0).optional(),
  quantityTotal: z.coerce.number().int().min(1).optional(),
  maxPerBooking: z.coerce.number().int().min(1).max(50).optional(),
  saleStart: z.coerce.date().optional().nullable(),
  saleEnd: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
});
export type TicketTypeUpdateInput = z.infer<typeof ticketTypeUpdateSchema>;
