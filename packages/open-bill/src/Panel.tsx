import { useState } from "react";
import type { PackagePanelProps } from "@central/hub";
import { PanelFrame, useDomain } from "@central/open-ui";
import { invoiceTotalCents, needs1099, type InvoiceDraft } from "./invoice";
import { formatCents, parseAmountToCents } from "./money";

export function OpenBillPanel({ shellId }: PackagePanelProps) {
  const [invoices, save] = useDomain<InvoiceDraft>(shellId, "bill");
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [form1099, setForm1099] = useState(false);
  const [error, setError] = useState("");

  return (
    <PanelFrame title="Open Bill">
      <p>This package does not read Open Books. Link the shells if you want those records copied.</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const cents = parseAmountToCents(amount);
          if (customer.trim() === "" || cents === null) {
            setError("Enter a customer and an amount like 400.");
            return;
          }
          setError("");
          save([
            ...invoices,
            { id: crypto.randomUUID(), customer: customer.trim(), lines: [{ cents }], form1099 },
          ]);
          setCustomer("");
          setAmount("");
        }}
      >
        <input
          aria-label="Customer"
          value={customer}
          onChange={(event) => setCustomer(event.target.value)}
          placeholder="Customer"
        />
        <input
          aria-label="Invoice amount"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Amount"
        />
        <label>
          <input type="checkbox" checked={form1099} onChange={(event) => setForm1099(event.target.checked)} /> 1099
        </label>
        <button type="submit">Add invoice</button>
      </form>
      {error ? <p role="status">{error}</p> : null}
      <ul>
        {invoices.map((invoice) => {
          const total = invoiceTotalCents(invoice.lines);
          return (
            <li key={invoice.id}>
              {invoice.customer} · {formatCents(total)}
              {needs1099(total, invoice.form1099) ? " · 1099" : ""}
            </li>
          );
        })}
      </ul>
    </PanelFrame>
  );
}
