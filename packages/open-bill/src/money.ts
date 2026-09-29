export function parseAmountToCents(amount: string): number | null {
  const cleaned = amount.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [dollars, fraction = ""] = cleaned.split(".");
  const cents = Number(dollars) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) return null;
  return cents;
}

export function formatCents(cents: number): string {
  const absolute = Math.abs(cents);
  const dollars = Math.floor(absolute / 100);
  const remainder = String(absolute % 100).padStart(2, "0");
  return `$${dollars}.${remainder}`;
}
