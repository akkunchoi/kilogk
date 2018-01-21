import { EventDetector } from "../src/EventDetector";
import { DailyLog } from "../src/DailyLog";
import { Record } from "../src/Record";
import { EventPatternType } from "../src/types";

describe("EventDetector", () => {
  let detector: EventDetector;

  beforeEach(() => {

    detector = new EventDetector({
      patterns: [
        {
          category: "Health",
          name: "Excercising",
          a: "excercised"
        },
        {
          category: "Private",
          name: "Sleeping",
          e: "^woke",
          s: "^slept"
        },
        {
          category: "Private",
          name: "Eating",
          a: "eat|ate|breakfast"
        },
        {
          category: "Learning",
          name: "Studying",
          e: "^studied"
        }

      ]
    });

  })


  it("全日イベントにマッチ", () => {

    const events = detector.detect([
      new DailyLog(new Date(2017, 0, 1), [
        new Record("excercised", new Date(2017, 0, 1, 10, 0)),
      ], [
      ])
    ]);

    expect(events[0].end.text).toBe("excercised");
    expect(events[0].pattern.type).toBe(EventPatternType.ALL_DAY);
    expect(events.length).toBe(1);

  });

  it("開始特定イベントにマッチ", () => {

    const events = detector.detect([
      new DailyLog(new Date(2017, 0, 1), [
        new Record("slept", new Date(2017, 0, 1, 1, 0)),
        new Record("woke", new Date(2017, 0, 1, 10, 0)),
      ], [
      ])
    ]);

    expect(events[0].end.text).toBe("woke");
    expect(events[0].pattern.type).toBe(EventPatternType.START_DEFINITE);
    expect(events[0].elapsed).toBe(9 * 3600 * 1000);
    expect(events.length).toBe(1);

  });

  it("開始推測イベントにマッチ", () => {

    const events = detector.detect([
      new DailyLog(new Date(2017, 0, 1), [
        new Record("unknown", new Date(2017, 0, 1, 10, 0)),
        new Record("studied English", new Date(2017, 0, 1, 11, 0)),
      ], [
      ])
    ]);

    expect(events[0].end.text).toBe("studied English");
    expect(events[0].pattern.type).toBe(EventPatternType.START_GUESS);
    expect(events[0].elapsed).toBe(1 * 3600 * 1000);
    expect(events.length).toBe(1);

  });

  it("全日イベントにマッチ", () => {

    const events = detector.detect([
      new DailyLog(new Date(2017, 0, 1), [
        new Record("woke up and had my breakfast", new Date(2017, 0, 1, 8, 0)),
        new Record("excercised", new Date(2017, 0, 1, 10, 0)),
        new Record("studied English", new Date(2017, 0, 1, 12, 0)),
        new Record("had lunch", new Date(2017, 0, 1, 13, 0)),
        new Record("studied English", new Date(2017, 0, 1, 18, 0)),
        new Record("took a bath", new Date(2017, 0, 1, 21, 0)),
        new Record("slept", new Date(2017, 0, 1, 21, 0)),
      ], [
      ])
    ]);

  });

});
