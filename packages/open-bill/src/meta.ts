/** Dewey OL. Display name Open Bill. Budgeting is Open Books (`OB`), not this package. */
export const OPEN_BILL_DEWEY = "OL" as const;
export const OPEN_BILL_NAME = "Open Bill" as const;
export const OPEN_BILL_PATH = "packages/open-bill" as const;
export const OPEN_BILL_HUB_DOMAIN = "bill" as const;
export const OPEN_BILL_SUMMARY =
  "Invoices and 1099 notes. Separate from Open Books (budgeting)." as const;

/**
 * Mount contract for SubTerra Metro and SubTerra Central.
 * The host catalog already lazy-loads `OpenBillPanel`. Central can keep importing
 * this package from root `packages/` (GV-0004 C16) without a second copy.
 */
export const openBillMeta = {
  code: OPEN_BILL_DEWEY,
  dewey: OPEN_BILL_DEWEY,
  name: OPEN_BILL_NAME,
  path: OPEN_BILL_PATH,
  summary: OPEN_BILL_SUMMARY,
  hubDomain: OPEN_BILL_HUB_DOMAIN,
} as const;
