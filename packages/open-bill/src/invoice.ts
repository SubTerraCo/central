/** Invoice draft stored on hub domain `bill`. Do not vendor InvoiceShelf (AGPL). */

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

/** Leftover: IRS 1099-NEC threshold is not applied here. Flag plus a positive total is enough for Phase 0+1. */
export function needs1099(totalCents: number, flagged: boolean): boolean {
  return flagged && totalCents > 0;
}
