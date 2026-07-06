import crypto from "node:crypto";
import type { PaymentProviderName } from "@eventsphere/shared";
import { env } from "@/config/env.js";
import { AppError } from "@/utils/app-error.js";
import { hmacSha256, safeEqual } from "@/utils/crypto.js";

/**
 * Payment provider abstraction (docs/10 §1 + brief: "Razorpay test mode, or a mock
 * payment system if integration is not possible").
 *
 * With RAZORPAY_* env vars set, orders are created against the real Razorpay REST
 * API. Without them, a mock provider issues order ids locally — signature
 * verification is IDENTICAL in both modes (HMAC-SHA256 over "orderId|paymentId"),
 * so the entire confirmation path stays real.
 */

const razorpayConfigured = Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);

function signingSecret(): string {
  return env.RAZORPAY_KEY_SECRET ?? `mock_${env.JWT_ACCESS_SECRET}`;
}

export function providerName(): PaymentProviderName {
  return razorpayConfigured ? "razorpay" : "mock";
}

export interface ProviderOrder {
  orderId: string;
  keyId: string;
  provider: PaymentProviderName;
}

export async function createOrder(amountPaise: number, receipt: string): Promise<ProviderOrder> {
  if (!razorpayConfigured) {
    return {
      orderId: `order_mock_${crypto.randomBytes(9).toString("hex")}`,
      keyId: "rzp_test_mock",
      provider: "mock",
    };
  }

  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Basic ${auth}` },
    body: JSON.stringify({ amount: amountPaise, currency: "INR", receipt }),
  });
  if (!res.ok) {
    throw new AppError(502, "INTERNAL_ERROR", "Payment gateway is unavailable — try again shortly");
  }
  const order = (await res.json()) as { id: string };
  return { orderId: order.id, keyId: env.RAZORPAY_KEY_ID!, provider: "razorpay" };
}

/** Razorpay checkout signature: HMAC_SHA256(order_id + "|" + payment_id, key_secret). */
export function computeSignature(orderId: string, paymentId: string): string {
  return hmacSha256(`${orderId}|${paymentId}`, signingSecret());
}

export function verifySignature(orderId: string, paymentId: string, signature: string): boolean {
  return safeEqual(computeSignature(orderId, paymentId), signature);
}

/** Webhook signature: HMAC_SHA256(raw body, webhook secret). */
export function verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
  if (!env.RAZORPAY_WEBHOOK_SECRET) return false;
  const expected = crypto.createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest("hex");
  return safeEqual(expected, signature);
}

export function isMockMode(): boolean {
  return !razorpayConfigured;
}
