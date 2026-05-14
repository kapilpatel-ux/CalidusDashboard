import crypto from "crypto";

export function createReadableId(prefix: string) {
  const digits = BigInt(`0x${crypto.randomUUID().replace(/-/g, "")}`).toString().slice(-6);
  return `${prefix}${digits}`;
}
