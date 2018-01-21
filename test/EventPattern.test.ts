import { EventPattern } from "../src/EventPattern";
import { EventPatternType } from "../src/types";

describe("EventPattern", () => {
  it("construct", () => {
    const pattern = new EventPattern({
      name: "patternA",
      category: "categoryA",
      e: "^e",
      s: "^s",
      total: false,
      within: {
        from: {
          hour: 1
        },
        to: {
          hour: 7
        }
      },
      withinInverse: false
    });

    expect(pattern.name).toBe("patternA");
    expect(pattern.category).toBe("categoryA");
    expect(pattern.allDay).toBeUndefined();
    expect(pattern.start).toEqual(/^s/);
    expect(pattern.end).toEqual(/^e/);
    expect(pattern.type).toBe(EventPatternType.START_DEFINITE);
    expect(pattern.total).toBe(false);
    expect(pattern.within).toEqual({
      from: {hour: 1}, to: {hour: 7}
    });
    expect(pattern.withinInverse).toBe(false);
  });

  it("construct", () => {
    const pattern = new EventPattern({
      name: "patternB",
      category: "categoryB",
      a: "^a",
      total: true,
    });

    expect(pattern.name).toBe("patternB");
    expect(pattern.category).toBe("categoryB");
    expect(pattern.allDay).toEqual(/^a/);
    expect(pattern.start).toBeUndefined();
    expect(pattern.end).toBeUndefined();
    expect(pattern.type).toBe(EventPatternType.ALL_DAY);
    expect(pattern.total).toBe(true);
    expect(pattern.within).toBeUndefined();
    expect(pattern.withinInverse).toBe(false);
  });

});
