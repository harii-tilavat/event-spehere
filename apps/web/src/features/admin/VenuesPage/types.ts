import { z } from "zod";
import { venueCreateSchema } from "@eventsphere/shared";

/** Form uses a comma-separated facilities string; converted to array on submit. */
export const venueFormSchema = venueCreateSchema.omit({ facilities: true, images: true }).extend({
  facilitiesText: z.string().trim().max(500).optional(),
});

export type VenueFormValues = z.infer<typeof venueFormSchema>;
