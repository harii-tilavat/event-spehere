import { z } from "zod";
import { asyncHandler } from "@/utils/async-handler.js";
import { ok } from "@/utils/respond.js";
import { AppError } from "@/utils/app-error.js";
import { storeImage } from "@/services/upload.service.js";

const folderSchema = z.enum(["avatars", "categories", "venues", "events", "organizers"]).default("events");

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError(400, "VALIDATION_ERROR", "No image file provided (field name: image)");
  const folder = folderSchema.parse(req.body.folder ?? "events");
  const result = await storeImage(req.file, folder);
  ok(res, "Image uploaded", result, { status: 201 });
});
