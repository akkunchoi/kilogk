import { EventDetector } from "../src/EventDetector";
import { DailyLog } from "../src/DailyLog";
import { Record } from "../src/Record";
import { EventPatternType, RecordType } from "../src/types";

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

    const result = detector.detect([
      new DailyLog(new Date(2017, 0, 1), [
        new Record("excercised", new Date(2017, 0, 1, 10, 0), RecordType.DAILY),
      ])
    ]);

    expect(result.events[0].end.text).toBe("excercised");
    expect(result.events[0].pattern.type).toBe(EventPatternType.ALL_DAY);
    expect(result.events.length).toBe(1);

  });

  it("開始特定イベントにマッチ", () => {

    const result = detector.detect([
      new DailyLog(new Date(2017, 0, 1), [
        new Record("slept", new Date(2017, 0, 1, 1, 0), RecordType.TIMELY),
        new Record("woke", new Date(2017, 0, 1, 10, 0), RecordType.TIMELY),
      ])
    ]);

    expect(result.events[0].end.text).toBe("woke");
    expect(result.events[0].pattern.type).toBe(EventPatternType.START_DEFINITE);
    expect(result.events[0].elapsed).toBe(9 * 3600 * 1000);
    expect(result.events.length).toBe(1);

  });

  it("開始特定イベントにマッチ（複数）", () => {

    const result = detector.detect([
      new DailyLog(new Date(2017, 0, 1), [
        new Record("slept", new Date(2017, 0, 1, 1, 0), RecordType.TIMELY),
        new Record("woke", new Date(2017, 0, 1, 10, 0), RecordType.TIMELY),
        new Record("slept", new Date(2017, 0, 1, 11, 0), RecordType.TIMELY),
        new Record("woke", new Date(2017, 0, 1, 12, 0), RecordType.TIMELY),
      ])
    ]);

    expect(result.events.length).toBe(2);
    expect(result.events[0].end.text).toBe("woke");
    expect(result.events[0].pattern.type).toBe(EventPatternType.START_DEFINITE);
    expect(result.events[0].elapsed).toBe(9 * 3600 * 1000);
    expect(result.events[1].end.text).toBe("woke");
    expect(result.events[1].pattern.type).toBe(EventPatternType.START_DEFINITE);
    expect(result.events[1].elapsed).toBe(1 * 3600 * 1000);

  });

  it("開始推測イベントにマッチ", () => {

    const result = detector.detect([
      new DailyLog(new Date(2017, 0, 1), [
        new Record("unknown", new Date(2017, 0, 1, 10, 0), RecordType.TIMELY),
        new Record("studied English", new Date(2017, 0, 1, 11, 0), RecordType.TIMELY),
      ])
    ]);

    expect(result.events[0].end.text).toBe("studied English");
    expect(result.events[0].pattern.type).toBe(EventPatternType.START_GUESS);
    expect(result.events[0].elapsed).toBe(1 * 3600 * 1000);
    expect(result.events.length).toBe(1);

  });

});
