import { SESSION_MAX_AGE_SECONDS } from "./constants";

/**
 * Cookie session helpers. Web Crypto only, so middleware on the edge can
 * verify the same token the Node login route signs. No database imports.
 */

function sessionSecret() {
  return process.env.SESSION_SECRET || "dev-only-session-secret";
}

export function devPassword() {
  return process.env.DEV_AUTH_PASSWORD || "dev";
}

export function passwordsMatch(input: string, expected: string) {
  if (input.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < input.length; i += 1) diff |= input.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function signSession(userId: string) {
  const payload = bytesToBase64Url(
    new TextEncoder().encode(
      JSON.stringify({
        userId,
        exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
      }),
    ),
  );
  const signature = await hmac(payload);
  return `${payload}.${signature}`;
}

export async function verifySessionToken(token: string | undefined | null): Promise<{ userId: string } | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const payload = token.slice(0, dot);
  const signature = token.slice(dot + 1);
  const expected = await hmac(payload);
  if (!safeEqual(signature, expected)) return null;
  try {
    const json = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as {
      userId?: unknown;
      exp?: unknown;
    };
    if (typeof json.userId !== "string" || typeof json.exp !== "number") return null;
    if (json.exp < Date.now()) return null;
    return { userId: json.userId };
  } catch {
    return null;
  }
}

export function readCookie(header: string | null, name: string) {
  if (!header) return undefined;
  for (const part of header.split(/;\s*/)) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    if (part.slice(0, index) === name) return decodeURIComponent(part.slice(index + 1));
  }
  return undefined;
}
