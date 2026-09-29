export type InvoiceLine = { cents: number };

export type InvoiceDraft = {
  id: string;
  customer: string;
  lines: InvoiceLine[];
  form1099: boolean;
};

export function invoiceTotalCents(lines: readonly InvoiceLine[]): number {
  return lines.reduce((total, line) => total + line.cents, 0);
}

export function needs1099(totalCents: number, flagged: boolean): boolean {
  return flagged && totalCents > 0;
}
