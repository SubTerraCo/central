export type LedgerEntry = {
  id: string;
  payee: string;
  amountCents: number;
  direction: "in" | "out";
};

export function parseAmountToCents(amount: string): number | null {
  const cleaned = amount.replace(/[$,\s]/g, "");
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const [dollars, fraction = ""] = cleaned.split(".");
  const cents = Number(dollars) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(cents)) return null;
  return cents;
}

export function formatCents(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  const dollars = Math.floor(absolute / 100);
  const remainder = String(absolute % 100).padStart(2, "0");
  return `${sign}$${dollars}.${remainder}`;
}

export function balanceCents(entries: readonly LedgerEntry[]): number {
  return entries.reduce((total, entry) => {
    return entry.direction === "in" ? total + entry.amountCents : total - entry.amountCents;
  }, 0);
}
