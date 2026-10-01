import { useState } from "react";
import { readRecords, writeRecords, type ShellId } from "@central/hub";

export function useDomain<T>(shellId: ShellId, domain: string) {
  const [rows, setRows] = useState(() => readRecords<T>(shellId, domain));

  function save(next: T[]) {
    setRows(next);
    writeRecords(shellId, domain, next);
  }

  return [rows, save] as const;
}
