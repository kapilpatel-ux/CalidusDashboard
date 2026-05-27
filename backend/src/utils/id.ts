import crypto from "crypto";

export function createReadableId(prefix: string) {
  const digits = BigInt(`0x${crypto.randomUUID().replace(/-/g, "")}`).toString().slice(-6);
  return `${prefix}${digits}`;
}

type IdRecord = {
  id?: string;
};

type SequentialIdModel = {
  find: (
    filter: Record<string, unknown>,
    projection: Record<string, unknown>,
  ) => {
    lean: <T>() => Promise<T>;
  };
};

export async function createSequentialId(
  model: SequentialIdModel,
  prefix: string,
  padLength = 3,
) {
  const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const idPattern = new RegExp(`^${escapedPrefix}\\d+$`, "i");
  const records = await model.find({ id: idPattern }, { _id: 0, id: 1 }).lean<IdRecord[]>();
  const highest = records.reduce((max, record) => {
    const id = String(record.id || "");
    const numericPart = id.slice(prefix.length);
    const number = Number.parseInt(numericPart, 10);
    return Number.isFinite(number) ? Math.max(max, number) : max;
  }, 0);

  return `${prefix}${String(highest + 1).padStart(padLength, "0")}`;
}
