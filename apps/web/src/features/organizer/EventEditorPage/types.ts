import { z } from "zod";

/** Client-side form schema — dates as datetime-local strings; the API re-validates with shared eventCreateSchema. */
export const eventFormSchema = z
  .object({
    title: z.string().trim().min(5, "Title must be at least 5 characters").max(200),
    description: z.string().trim().min(20, "Description must be at least 20 characters").max(10_000),
    categoryId: z.string().min(1, "Pick a category"),
    venueId: z.string().min(1, "Pick a venue"),
    bannerUrl: z.string().url().max(500).optional().nullable(),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    registrationDeadline: z.string().min(1, "Registration deadline is required"),
    capacity: z.coerce.number().int().min(1),
  })
  .refine((v) => !v.startTime || !v.endTime || new Date(v.endTime) > new Date(v.startTime), {
    path: ["endTime"],
    message: "End must be after start",
  })
  .refine((v) => !v.startTime || !v.registrationDeadline || new Date(v.registrationDeadline) <= new Date(v.startTime), {
    path: ["registrationDeadline"],
    message: "Deadline must be on or before the start time",
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

/** Ticket dialog form — price entered in rupees, converted to paise on submit. */
export const ticketFormSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).optional(),
  priceRupees: z.coerce.number().min(0),
  quantityTotal: z.coerce.number().int().min(1),
  maxPerBooking: z.coerce.number().int().min(1).max(50),
  isActive: z.boolean(),
});

export type TicketFormValues = z.infer<typeof ticketFormSchema>;
