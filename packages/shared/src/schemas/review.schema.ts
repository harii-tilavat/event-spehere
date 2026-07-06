import { z } from "zod";
import { paginationQuerySchema } from "./common.schema.js";

export const reviewCreateSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional().nullable(),
});
export type ReviewCreateInput = z.infer<typeof reviewCreateSchema>;

export const reviewReplySchema = z.object({
  reply: z.string().trim().min(1).max(1000),
});
export type ReviewReplyInput = z.infer<typeof reviewReplySchema>;

export const reviewListQuerySchema = paginationQuerySchema;
