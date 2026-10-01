import { useState } from "react";
import type { PackagePanelProps } from "@central/hub";
import { PanelFrame, useDomain } from "@central/open-ui";
import { balanceCents, formatCents, parseAmountToCents, type LedgerEntry } from "./ledger";

export function OpenBooksPanel({ shellId }: PackagePanelProps) {
  const [entries, save] = useDomain<LedgerEntry>(shellId, "books");
  const [payee, setPayee] = useState("");
  const [amount, setAmount] = useState("");
  const [direction, setDirection] = useState<LedgerEntry["direction"]>("out");
  const [error, setError] = useState("");

  return (
    <PanelFrame title="Open Books">
      <p>Budget entries stay here. Invoices live in Open Bill. Actual Budget remains the engine to wrap later.</p>
      <p>Balance {formatCents(balanceCents(entries))}</p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const amountCents = parseAmountToCents(amount);
          if (payee.trim() === "" || amountCents === null) {
            setError("Enter a payee and an amount like 12.50.");
            return;
          }
          setError("");
          save([
            ...entries,
            { id: crypto.randomUUID(), payee: payee.trim(), amountCents, direction },
          ]);
          setPayee("");
          setAmount("");
        }}
      >
        <input aria-label="Payee" value={payee} onChange={(event) => setPayee(event.target.value)} placeholder="Payee" />
        <input aria-label="Amount" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="12.50" />
        <select
          aria-label="Direction"
          value={direction}
          onChange={(event) => {
            const next = event.target.value;
            if (next === "in" || next === "out") setDirection(next);
          }}
        >
          <option value="out">Out</option>
          <option value="in">In</option>
        </select>
        <button type="submit">Add entry</button>
      </form>
      {error ? <p role="status">{error}</p> : null}
      <ul>
        {entries.map((entry) => (
          <li key={entry.id}>
            {entry.payee} · {entry.direction} {formatCents(entry.amountCents)}
          </li>
        ))}
      </ul>
    </PanelFrame>
  );
}
