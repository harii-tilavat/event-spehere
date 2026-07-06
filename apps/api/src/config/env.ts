import "dotenv/config";
import { z } from "zod";

// Phase-1+ vars (JWT, SMTP, Cloudinary, Razorpay) are optional for now and
// become required in the phase that uses them — see docs/07 §5 for the full list.
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  FRONTEND_URL: z.string().url().default("http://localhost:5173"),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().default(3306),
  DB_NAME: z.string().min(1),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().default(""),

  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().default(7),
  QR_TICKET_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
