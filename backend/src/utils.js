// Parse amount from request body to INTEGER paise.
// Accepts "12.50" or 12.5 — rejects anything that isn't a valid positive number.
export function parseAmount(raw) {
  const n = Math.round(parseFloat(raw) * 100);
  if (!isFinite(n) || n <= 0) return null;
  return n;
}

// Validates that a YYYY-MM-DD string is a real calendar date.
export function isValidDate(str) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str);
  return !isNaN(d) && d.toISOString().slice(0, 10) === str;
}
