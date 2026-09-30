import type { StubWriteResult } from "./types";

export function notImplementedWrite(operation: string): StubWriteResult {
  return {
    implemented: false,
    status: 501,
    operation,
    message: `${operation} is not implemented yet. Central will write development tags and views after Powerline lock.`,
  };
}
