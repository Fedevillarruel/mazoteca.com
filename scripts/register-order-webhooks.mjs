/**
 * Registra los webhooks de órdenes en TiendaNube.
 * Uso: node scripts/register-order-webhooks.mjs
 *
 * Events necesarios:
 *   - order/created
 *   - order/updated
 *   - order/paid
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, "../.env.local");
const envVars = {};
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) envVars[match[1].trim()] = match[2].trim();
}

const TN_STORE_ID = process.env.TIENDANUBE_STORE_ID || envVars["TIENDANUBE_STORE_ID"];
const TN_ACCESS_TOKEN = process.env.TIENDANUBE_ACCESS_TOKEN || envVars["TIENDANUBE_ACCESS_TOKEN"];
const TN_APP_ID = "28885";
// Argumento CLI tiene máxima prioridad: node script.mjs https://mi-url.com
const cliUrl = process.argv[2];
const APP_URL = cliUrl || process.env.NEXT_PUBLIC_APP_URL || envVars["NEXT_PUBLIC_APP_URL"] || "https://mazoteca.com";
// Si la URL apunta a localhost, usamos la de producción como fallback
const FINAL_URL = (APP_URL.includes("localhost") && !cliUrl) ? "https://mazoteca.com" : APP_URL;

const TN_HEADERS = {
  Authentication: `bearer ${TN_ACCESS_TOKEN}`,
  "User-Agent": `Mazoteca (integraciones@fedini.app) AppId/${TN_APP_ID}`,
  "Content-Type": "application/json",
};

const WEBHOOK_URL = `${FINAL_URL}/api/tiendanube/orders`;

const EVENTS = ["order/created", "order/updated", "order/paid"];

async function listWebhooks() {
  const res = await fetch(
    `https://api.tiendanube.com/v1/${TN_STORE_ID}/webhooks`,
    { headers: TN_HEADERS }
  );
  return res.json();
}

async function registerWebhook(event, url) {
  const res = await fetch(
    `https://api.tiendanube.com/v1/${TN_STORE_ID}/webhooks`,
    {
      method: "POST",
      headers: TN_HEADERS,
      body: JSON.stringify({ event, url }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

console.log("📋 Webhooks de órdenes TiendaNube\n");
console.log("  URL destino:", WEBHOOK_URL);
console.log("  Eventos:", EVENTS.join(", "), "\n");

const existing = await listWebhooks();
console.log("Webhooks actuales:", existing.length ?? 0);

for (const event of EVENTS) {
  const alreadyExists = existing.find?.(
    (w) => w.event === event && w.url === WEBHOOK_URL
  );

  if (alreadyExists) {
    console.log(`  ✓ Ya existe: ${event} (ID: ${alreadyExists.id})`);
    continue;
  }

  try {
    const wh = await registerWebhook(event, WEBHOOK_URL);
    console.log(`  ✅ Registrado: ${event} (ID: ${wh.id})`);
  } catch (err) {
    console.error(`  ❌ Error registrando ${event}:`, err.message);
  }
}

console.log("\n✔ Listo");
