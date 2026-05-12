/**
 * OceanSense IoT Gateway
 *
 * HTTP server that receives sensor data from ESP32 buoys and submits
 * the corresponding Solana transactions using the operator's keypair.
 *
 * Usage:
 *   KEYPAIR_PATH=~/.config/solana/id.json \
 *   RPC_URL=https://api.devnet.solana.com  \
 *   node --experimental-strip-types gateway/index.ts
 */

import http from "node:http";
import fs   from "node:fs";
import path from "node:path";
import os   from "node:os";
import { Connection, Keypair } from "@solana/web3.js";

// ── Config from env ───────────────────────────────────────────────
const PORT         = Number(process.env.PORT        ?? 3001);
const RPC_URL      = process.env.RPC_URL            ?? "https://api.devnet.solana.com";
const KEYPAIR_PATH = process.env.KEYPAIR_PATH       ?? path.join(os.homedir(), ".config/solana/id.json");
const CPEN_MINT    = process.env.NEXT_PUBLIC_CPEN_MINT ?? "";

// ── Load keypair ──────────────────────────────────────────────────
function loadKeypair(filePath: string): Keypair {
  const resolved = filePath.replace("~", os.homedir());
  if (!fs.existsSync(resolved)) {
    throw new Error(`Keypair file not found: ${resolved}\nSet KEYPAIR_PATH env var.`);
  }
  const raw = JSON.parse(fs.readFileSync(resolved, "utf-8")) as number[];
  return Keypair.fromSecretKey(Uint8Array.from(raw));
}

// ── Lazy-load SDK client (avoids import error if deps missing) ────
async function getClient() {
  // Dynamic import so the error is clear if @coral-xyz/anchor is missing
  const { OceanSenseClient } = await import("../sdk/src/client.js");
  const keypair    = loadKeypair(KEYPAIR_PATH);
  const connection = new Connection(RPC_URL, "confirmed");
  return new OceanSenseClient({
    connection,
    keypair,
    cpenMint: CPEN_MINT || undefined,
  });
}

// ── HTTP helpers ──────────────────────────────────────────────────
function readBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); }
      catch { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

function send(res: http.ServerResponse, status: number, data: unknown) {
  const payload = JSON.stringify(data);
  res.writeHead(status, {
    "Content-Type":  "application/json",
    "Content-Length": Buffer.byteLength(payload),
    "Access-Control-Allow-Origin": "*",
  });
  res.end(payload);
}

// ── Route handlers ────────────────────────────────────────────────

/**
 * POST /register
 * Register a new buoy on-chain.
 *
 * Body: { buoyId, latDeg, lngDeg, locationName }
 * Response: { signature }
 *
 * ESP32 example (Arduino):
 *   HTTPClient http;
 *   http.begin("http://gateway:3001/register");
 *   http.addHeader("Content-Type", "application/json");
 *   http.POST("{\"buoyId\":\"PAITA-001\",\"latDeg\":-5.0623,\"lngDeg\":-81.43,\"locationName\":\"Boya Paita Norte\"}");
 */
async function handleRegister(req: http.IncomingMessage, res: http.ServerResponse) {
  const body = await readBody(req) as any;
  const { buoyId, latDeg, lngDeg, locationName } = body;

  if (!buoyId || latDeg == null || lngDeg == null || !locationName) {
    return send(res, 400, { error: "Required: buoyId, latDeg, lngDeg, locationName" });
  }
  if (typeof buoyId !== "string" || buoyId.length > 32) {
    return send(res, 400, { error: "buoyId must be a string ≤ 32 chars" });
  }

  const client = await getClient();
  const signature = await client.registerBuoy({ buoyId, latDeg, lngDeg, locationName });
  send(res, 200, { signature, buoyId, explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet` });
}

/**
 * POST /reading
 * Submit an ocean reading on-chain.
 *
 * Body: { buoyId, temperature, salinity, waveHeight, pollutionLevel }
 * Response: { signature, reward_usdc }
 *
 * Pollution levels: 0 = clean, 1 = slight, 2 = moderate, 3 = critical
 *
 * ESP32 example (Arduino):
 *   String payload = "{\"buoyId\":\"PAITA-001\","
 *     "\"temperature\":22.5,\"salinity\":35.1,"
 *     "\"waveHeight\":0.85,\"pollutionLevel\":0}";
 *   http.POST(payload);
 */
async function handleReading(req: http.IncomingMessage, res: http.ServerResponse) {
  const body = await readBody(req) as any;
  const { buoyId, temperature, salinity, waveHeight, pollutionLevel } = body;

  if (!buoyId || temperature == null || salinity == null || waveHeight == null || pollutionLevel == null) {
    return send(res, 400, { error: "Required: buoyId, temperature, salinity, waveHeight, pollutionLevel" });
  }
  if (pollutionLevel < 0 || pollutionLevel > 3 || !Number.isInteger(pollutionLevel)) {
    return send(res, 400, { error: "pollutionLevel must be integer 0–3" });
  }

  const REWARDS: Record<number, number> = { 3: 5.0, 2: 2.0, 1: 1.0, 0: 1.0 };
  const client    = await getClient();
  const signature = await client.submitReading({
    buoyId,
    temperature,
    salinity,
    waveHeight,
    pollutionLevel,
  });

  send(res, 200, {
    signature,
    buoyId,
    reward_usdc: REWARDS[pollutionLevel],
    explorer: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
  });
}

/**
 * GET /buoys
 * Return all registered buoys from the program.
 */
async function handleBuoys(_req: http.IncomingMessage, res: http.ServerResponse) {
  const client = await getClient();
  const buoys  = await client.fetchBuoys();
  send(res, 200, { buoys, count: buoys.length });
}

/**
 * GET /health
 * Health check — returns gateway status and operator public key.
 */
async function handleHealth(_req: http.IncomingMessage, res: http.ServerResponse) {
  let operatorPubkey = "unknown";
  let status = "ok";
  try {
    const keypair    = loadKeypair(KEYPAIR_PATH);
    operatorPubkey   = keypair.publicKey.toBase58();
  } catch (e: any) {
    status = "keypair_missing";
  }
  send(res, 200, { status, operatorPubkey, rpcUrl: RPC_URL, port: PORT });
}

// ── Main server ───────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const method = req.method ?? "GET";
  const url    = req.url    ?? "/";

  // CORS preflight
  if (method === "OPTIONS") {
    res.writeHead(204, { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST", "Access-Control-Allow-Headers": "Content-Type" });
    return res.end();
  }

  try {
    if (method === "POST" && url === "/register") return await handleRegister(req, res);
    if (method === "POST" && url === "/reading")  return await handleReading(req, res);
    if (method === "GET"  && url === "/buoys")    return await handleBuoys(req, res);
    if (method === "GET"  && url === "/health")   return await handleHealth(req, res);

    send(res, 404, {
      error: "Not found",
      routes: [
        "POST /register  — register a new buoy",
        "POST /reading   — submit an ocean reading",
        "GET  /buoys     — list all buoys",
        "GET  /health    — gateway health check",
      ],
    });
  } catch (err: any) {
    console.error(`[${method} ${url}]`, err.message);
    send(res, 500, { error: err.message ?? "Internal server error" });
  }
});

server.listen(PORT, () => {
  console.log(`\n🌊 OceanSense Gateway running on port ${PORT}`);
  console.log(`   RPC  : ${RPC_URL}`);
  console.log(`   Keys : ${KEYPAIR_PATH}`);
  console.log(`\nEndpoints:`);
  console.log(`   POST http://localhost:${PORT}/register`);
  console.log(`   POST http://localhost:${PORT}/reading`);
  console.log(`   GET  http://localhost:${PORT}/buoys`);
  console.log(`   GET  http://localhost:${PORT}/health\n`);
});
