// ============================================================
// Mercado Pago Integration — Server-side only
// ============================================================
// Handles subscription creation, webhook verification, and status checks.
// Uses the official REST API.
// ============================================================

import { createHmac } from "crypto";

const MP_BASE_URL = "https://api.mercadopago.com";
const MP_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN!;

function getHeaders(idempotencyKey?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
    "Content-Type": "application/json",
  };
  if (idempotencyKey) {
    headers["X-Idempotency-Key"] = idempotencyKey;
  }
  return headers;
}

// ---- Preapproval Plan (Subscription Template) ----

export interface CreatePlanParams {
  reason: string;
  auto_recurring: {
    frequency: number;
    frequency_type: "months" | "days";
    transaction_amount: number;
    currency_id: string;
  };
  back_url: string;
}

export async function createPreapprovalPlan(params: CreatePlanParams) {
  const response = await fetch(`${MP_BASE_URL}/preapproval_plan`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`MP createPlan failed: ${JSON.stringify(error)}`);
  }

  return response.json();
}

// ---- Preapproval (Subscription Instance) ----

export interface CreateSubscriptionParams {
  preapproval_plan_id: string;
  payer_email: string;
  card_token_id?: string;
  back_url: string;
  reason: string;
  external_reference: string; // user_id
}

export async function createSubscription(
  params: CreateSubscriptionParams,
  idempotencyKey: string
) {
  const response = await fetch(`${MP_BASE_URL}/preapproval`, {
    method: "POST",
    headers: getHeaders(idempotencyKey),
    body: JSON.stringify({
      ...params,
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        currency_id: "ARS",
      },
      status: "pending",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`MP createSubscription failed: ${JSON.stringify(error)}`);
  }

  return response.json();
}

export async function getSubscription(subscriptionId: string) {
  const response = await fetch(
    `${MP_BASE_URL}/preapproval/${subscriptionId}`,
    {
      headers: getHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(`MP getSubscription failed: ${response.status}`);
  }

  return response.json();
}

export async function cancelSubscription(subscriptionId: string) {
  const response = await fetch(
    `${MP_BASE_URL}/preapproval/${subscriptionId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status: "cancelled" }),
    }
  );

  if (!response.ok) {
    throw new Error(`MP cancelSubscription failed: ${response.status}`);
  }

  return response.json();
}

export async function pauseSubscription(subscriptionId: string) {
  const response = await fetch(
    `${MP_BASE_URL}/preapproval/${subscriptionId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status: "paused" }),
    }
  );

  if (!response.ok) {
    throw new Error(`MP pauseSubscription failed: ${response.status}`);
  }

  return response.json();
}

// ---- Webhook Verification ----

/**
 * Verify Mercado Pago webhook signature.
 * Mercado Pago sends a query parameter `data.id` and type.
 * For production, verify the x-signature header.
 */
export function verifyWebhookSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string,
  secret: string
): boolean {
  if (!xSignature || !xRequestId) return false;

  // Parse the x-signature header
  const parts = xSignature.split(",");
  const tsMatch = parts.find((p) => p.trim().startsWith("ts="));
  const hashMatch = parts.find((p) => p.trim().startsWith("v1="));

  if (!tsMatch || !hashMatch) return false;

  const ts = tsMatch.split("=")[1]?.trim();
  const receivedHash = hashMatch.split("=")[1]?.trim();

  if (!ts || !receivedHash) return false;

  // Build manifest
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  // Compute HMAC-SHA256
  const expectedHash = createHmac("sha256", secret)
    .update(manifest)
    .digest("hex");

  return expectedHash === receivedHash;
}

// ---- Map MP status to internal status ----

export function mapMPStatus(
  mpStatus: string
): "active" | "cancelled" | "past_due" | "paused" | "expired" {
  switch (mpStatus) {
    case "authorized":
      return "active";
    case "paused":
      return "paused";
    case "cancelled":
      return "cancelled";
    case "pending":
      return "past_due";
    default:
      return "expired";
  }
}
