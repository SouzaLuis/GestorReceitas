import { describe, expect, it } from "vitest";
import { addDays, getMonday, toISODate } from "../date";

describe("date utils", () => {
  it("returns the Monday of the current week for a mid-week date", () => {
    // 2026-07-01 is a Wednesday
    const monday = getMonday(new Date("2026-07-01T12:00:00"));
    expect(toISODate(monday)).toBe("2026-06-29");
  });

  it("returns the same date when it is already Monday", () => {
    const monday = getMonday(new Date("2026-06-29T12:00:00"));
    expect(toISODate(monday)).toBe("2026-06-29");
  });

  it("rolls back to the previous Monday for a Sunday", () => {
    const monday = getMonday(new Date("2026-07-05T12:00:00"));
    expect(toISODate(monday)).toBe("2026-06-29");
  });

  it("adds days across month boundaries", () => {
    expect(addDays("2026-06-29", 6)).toBe("2026-07-05");
    expect(addDays("2026-06-29", -1)).toBe("2026-06-28");
  });
});
