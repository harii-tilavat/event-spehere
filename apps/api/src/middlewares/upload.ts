import multer from "multer";
import { AppError } from "@/utils/app-error.js";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB (docs/06 §5)
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(new AppError(422, "VALIDATION_ERROR", "Only JPEG, PNG, and WebP images are allowed"));
      return;
    }
    cb(null, true);
  },
});
