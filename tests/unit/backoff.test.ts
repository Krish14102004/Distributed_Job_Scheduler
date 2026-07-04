import { describe, expect, it } from "vitest";
import { computeBackoffMs } from "../../packages/shared/src/retry/backoff";

describe("computeBackoffMs", () => {
  it("returns fixed delay", () => {
    expect(computeBackoffMs("FIXED", 1, 1000, 10000)).toBe(1000);
  });

  it("returns linear delay", () => {
    expect(computeBackoffMs("LINEAR", 3, 1000, 10000)).toBe(3000);
  });

  it("returns exponential delay and caps it", () => {
    expect(computeBackoffMs("EXPONENTIAL", 4, 1000, 5000)).toBe(5000);
  });
});
