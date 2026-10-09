// Prefix cells that spreadsheets would interpret as formulas (CSV injection).
const FORMULA_START = /^[=+\-@\t\r]/;

const escapeCell = (value) => {
  if (value === null || value === undefined) return "";
  let str = value instanceof Date ? value.toISOString().slice(0, 10) : String(value);
  if (FORMULA_START.test(str)) str = `'${str}`;
  return /[",\n\r]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

// columns: [{ header: 'Name', value: (row) => row.name }]
const toCsv = (columns, rows) => {
  const head = columns.map((c) => escapeCell(c.header)).join(",");
  const body = rows.map((row) => columns.map((c) => escapeCell(c.value(row))).join(","));
  return [head, ...body].join("\r\n");
};

module.exports = { toCsv, escapeCell };
