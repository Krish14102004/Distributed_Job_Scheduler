export type RetryStrategy = "FIXED" | "LINEAR" | "EXPONENTIAL";

export function computeBackoffMs(
  strategy: RetryStrategy,
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number
): number {
  let delay: number;
  switch (strategy) {
    case "FIXED":
      delay = baseDelayMs;
      break;
    case "LINEAR":
      delay = baseDelayMs * attempt;
      break;
    case "EXPONENTIAL":
      delay = baseDelayMs * Math.pow(2, attempt - 1);
      break;
    default:
      delay = baseDelayMs;
  }
  return Math.min(delay, maxDelayMs);
}
