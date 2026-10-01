import { useState } from "react";
import { readRecords, writeRecords, type ShellId } from "@central/hub";
import { PanelFrame, tokens } from "@central/open-ui";
import { gigFeeApplies, type GigRole } from "./fee";

type Listing = {
  id: string;
  name: string;
  rate: string;
  role: GigRole;
  crewSize: number;
};

const domain = "gig";

export function OpenGigPanel({ shellId }: { shellId: ShellId }) {
  const [listings, setListings] = useState(() => readRecords<Listing>(shellId, domain));
  const [name, setName] = useState("");
  const [rate, setRate] = useState("");
  const [role, setRole] = useState<GigRole>("freelancer");
  const [crewSize, setCrewSize] = useState(1);

  function save() {
    if (name.trim() === "") return;
    const next = [
      ...listings,
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        rate: rate.trim(),
        role,
        crewSize,
      },
    ];
    setListings(next);
    writeRecords(shellId, domain, next);
    setName("");
    setRate("");
  }

  const fee = gigFeeApplies(role, crewSize);

  return (
    <PanelFrame title="Open Gig">
      <p style={{ color: tokens.onSurfaceVariant }}>
        {fee
          ? "Crew manager fee applies at 5 or more members."
          : "No fee. A solo freelancer lists for free."}
      </p>
      <label>
        Name{" "}
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        Rate{" "}
        <input value={rate} onChange={(event) => setRate(event.target.value)} />
      </label>
      <label>
        Role{" "}
        <select
          value={role}
          onChange={(event) => {
            const next = event.target.value;
            if (next === "freelancer" || next === "crew-manager") setRole(next);
          }}
        >
          <option value="freelancer">Freelancer</option>
          <option value="crew-manager">Crew manager</option>
        </select>
      </label>
      <label>
        Crew size{" "}
        <input
          type="number"
          min={1}
          value={crewSize}
          onChange={(event) => setCrewSize(Number(event.target.value))}
        />
      </label>
      <button type="button" onClick={save}>
        Add listing
      </button>
      <ul>
        {listings.map((listing) => (
          <li key={listing.id}>
            {listing.name} · {listing.rate || "rate open"} ·{" "}
            {gigFeeApplies(listing.role, listing.crewSize) ? "fee" : "free"}
          </li>
        ))}
      </ul>
    </PanelFrame>
  );
}
