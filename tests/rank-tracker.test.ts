import { describe, it, expect } from "vitest";
import { cadenceForAge } from "@/lib/measurement/rank-tracker";

describe("cadenceForAge", () => {
  it("0-7 days = daily", () => {
    expect(cadenceForAge(0)).toBe("daily");
    expect(cadenceForAge(7)).toBe("daily");
  });
  it("8-30 days = every-3-days", () => {
    expect(cadenceForAge(8)).toBe("every-3-days");
    expect(cadenceForAge(30)).toBe("every-3-days");
  });
  it("31-90 days = weekly", () => {
    expect(cadenceForAge(31)).toBe("weekly");
    expect(cadenceForAge(90)).toBe("weekly");
  });
  it("91-365 days = biweekly", () => {
    expect(cadenceForAge(91)).toBe("biweekly");
    expect(cadenceForAge(365)).toBe("biweekly");
  });
  it("> 365 days = monthly", () => {
    expect(cadenceForAge(400)).toBe("monthly");
  });
});
