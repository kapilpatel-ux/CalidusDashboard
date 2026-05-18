import crypto from "crypto";
import { env } from "../../config/env.js";

const algorithm = "sha256";
const iterations = 120000;
const keyLength = 64;

function base64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, iterations, keyLength, algorithm).toString("hex");
  return `${iterations}:${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [storedIterations, salt, hash] = storedHash.split(":");
  if (!storedIterations || !salt || !hash) return false;

  const candidate = crypto
    .pbkdf2Sync(password, salt, Number(storedIterations), keyLength, algorithm)
    .toString("hex");

  return crypto.timingSafeEqual(Buffer.from(candidate, "hex"), Buffer.from(hash, "hex"));
}

export function signJwt(payload: Record<string, unknown>) {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + 7 * 24 * 60 * 60,
  };
  const unsigned = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(tokenPayload))}`;
  const signature = crypto
    .createHmac("sha256", env.jwtSecret)
    .update(unsigned)
    .digest();

  return `${unsigned}.${base64Url(signature)}`;
}
