import crypto from "node:crypto";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

/** Slug + short random suffix — unique without a lookup round-trip. */
export function uniqueSlug(input: string): string {
  return `${slugify(input)}-${crypto.randomBytes(3).toString("hex")}`;
}
