type CsvColumn<Row> = {
  key: keyof Row & string;
  label: string;
};

const stringifyCsvValue = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "bigint" || typeof value === "boolean") return String(value);
  if (value instanceof Date) return value.toISOString();
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const escapeCsvCell = (raw: string) => {
  const needsQuotes = /[",\n\r]/.test(raw);
  const escaped = raw.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
};

export const objectsToCsv = <Row extends Record<string, unknown>>(
  rows: Row[],
  columns: CsvColumn<Row>[],
) => {
  const header = columns.map((c) => escapeCsvCell(c.label)).join(",");
  const lines = rows.map((row) =>
    columns
      .map((c) => escapeCsvCell(stringifyCsvValue(row[c.key])))
      .join(","),
  );

  // UTF-8 BOM helps Excel open UTF-8 correctly.
  return `\uFEFF${header}\n${lines.join("\n")}\n`;
};

