import { describe, expect, it } from "vitest";
import { assertTransition, canTransition } from "../../packages/shared/src/state-machine/transitions";

describe("state machine", () => {
  it("allows valid transitions", () => {
    expect(canTransition("QUEUED", "CLAIMED")).toBe(true);
    expect(canTransition("RUNNING", "FAILED")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(() => assertTransition("COMPLETED", "QUEUED")).toThrow(/Illegal job transition/);
  });
});
