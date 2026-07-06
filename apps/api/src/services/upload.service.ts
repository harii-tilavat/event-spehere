import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import type { UploadResultDto } from "@eventsphere/shared";
import { env } from "@/config/env.js";
import { AppError } from "@/utils/app-error.js";

export const UPLOADS_DIR = path.resolve("uploads");

const cloudinaryConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);

/**
 * Stores an image and returns its public URL.
 * Cloudinary when configured (docs/07 §5); local disk under /uploads otherwise,
 * so image flows work end-to-end in development without external credentials.
 */
export async function storeImage(file: Express.Multer.File, folder: string): Promise<UploadResultDto> {
  if (cloudinaryConfigured) {
    const { v2: cloudinary } = await import("cloudinary");
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
    });
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: `eventsphere/${folder}`, resource_type: "image" },
        (err, res) => (err || !res ? reject(err) : resolve(res)),
      );
      stream.end(file.buffer);
    });
    return { url: result.secure_url, provider: "cloudinary" };
  }

  const ext = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" }[file.mimetype];
  if (!ext) throw new AppError(422, "VALIDATION_ERROR", "Unsupported image type");

  const name = `${folder}-${crypto.randomBytes(8).toString("hex")}${ext}`;
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOADS_DIR, name), file.buffer);
  return { url: `http://localhost:${env.PORT}/uploads/${name}`, provider: "local" };
}
