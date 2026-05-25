export type ParsedCsv<Row extends Record<string, string>> = {
  headers: string[];
  rows: Row[];
};

const normalizeNewlines = (input: string) => input.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

// Minimal RFC4180-ish CSV parser with quoted fields support.
export const parseCsv = (input: string) => {
  const text = normalizeNewlines(input);
  const rows: string[][] = [];

  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };

  const pushRow = () => {
    // Skip trailing completely empty row
    const allEmpty = row.every((c) => c.trim() === "");
    if (!allEmpty) rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === "\"") {
        const next = text[i + 1];
        if (next === "\"") {
          field += "\"";
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === "\"") {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      pushField();
      continue;
    }

    if (ch === "\n") {
      pushField();
      pushRow();
      continue;
    }

    field += ch;
  }

  pushField();
  pushRow();

  if (rows.length === 0) {
    return { headers: [], rows: [] } as ParsedCsv<Record<string, string>>;
  }

  const headers = rows[0].map((h) => h.trim());
  if (headers[0] && headers[0].charCodeAt(0) == 0xfeff) {
    headers[0] = headers[0].slice(1);
  }
  const dataRows = rows.slice(1);
  const mapped = dataRows.map((r) => {
    const obj: Record<string, string> = {};
    for (let i = 0; i < headers.length; i++) obj[headers[i]] = (r[i] ?? "").trim();
    return obj;
  });

  return { headers, rows: mapped } as ParsedCsv<Record<string, string>>;
};
