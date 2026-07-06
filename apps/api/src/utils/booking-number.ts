import crypto from "node:crypto";

/** Unambiguous alphabet (no 0/O/1/I) — e.g. EVS-9F3K2M1Q. */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateBookingNumber(): string {
  const bytes = crypto.randomBytes(8);
  let code = "";
  for (let i = 0; i < 8; i++) code += ALPHABET[bytes[i] % ALPHABET.length];
  return `EVS-${code}`;
}

export function generateTicketCode(): string {
  const bytes = crypto.randomBytes(16);
  let code = "";
  for (let i = 0; i < 16; i++) code += ALPHABET[bytes[i] % ALPHABET.length];
  return code;
}
