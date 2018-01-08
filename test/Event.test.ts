import { Event } from "../src/Event";
import { EventPattern } from "../src/EventPattern";
import { Record } from "../src/Record";

describe("Event", () => {

  describe("standard event", () => {

    it("elapsedでミリ秒での期間が取得できる", () => {
      const from = new Record("from record", new Date(2017, 1, 1, 0, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 1, 10, 0, 0));
      const pattern = new EventPattern({
        name: "sleep",
        category: "private",
        s: "from",
        e: "to"
      });

      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(10 * 3600 * 1000);
    });

  });

  describe("within event", () => {

    const pattern = new EventPattern({
      name: "sleep",
      category: "private",
      s: "from",
      e: "to",
      within: {
        from: {
          hour: 21
        },
        to: {
          hour: 5
        }
      }
    });

    it("elapsedで特定期間内でミリ秒での期間が取得できる（内包、日付超えない1）", () => {
      const from = new Record("from record", new Date(2017, 1, 1, 21, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 1, 22, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(1 * 3600 * 1000);
    });

    it("elapsedで特定期間内でミリ秒での期間が取得できる（内包、日付超えない2）", () => {
      const from = new Record("from record", new Date(2017, 1, 2, 1, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 2, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(1 * 3600 * 1000);
    });
    it("elapsedで特定期間内でミリ秒での期間が取得できる（内包、日付超える）", () => {
      const from = new Record("from record", new Date(2017, 1, 1, 23, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 1, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(2 * 3600 * 1000);
    });

    it("elapsedで特定期間内でミリ秒での期間が取得できる（後方一部範囲内、日付超える）", () => {
      const from = new Record("from record", new Date(2017, 1, 1, 23, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 9, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(6 * 3600 * 1000);
    });

    it("elapsedで特定期間内でミリ秒での期間が取得できる（後方一部範囲内、日付超えない）", () => {
      const from = new Record("from record", new Date(2017, 1, 2, 0, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 9, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(5 * 3600 * 1000);
    });

    it("elapsedで特定期間内でミリ秒での期間が取得できる（範囲外1）", () => {
      const from = new Record("from record", new Date(2017, 1, 2, 20, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 21, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(0 * 3600 * 1000);
    });

    it("elapsedで特定期間内でミリ秒での期間が取得できる（範囲外2）", () => {
      const from = new Record("from record", new Date(2017, 1, 2, 5, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 6, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(0 * 3600 * 1000);
    });

    it("elapsedで特定期間内でミリ秒での期間が取得できる（前方一部範囲内）", () => {
      const from = new Record("from record", new Date(2017, 1, 2, 20, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 22, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(1 * 3600 * 1000);
    });

    it("elapsedで特定期間内でミリ秒での期間が取得できる（後方一部範囲内）", () => {
      const from = new Record("from record", new Date(2017, 1, 2, 4, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 6, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(1 * 3600 * 1000);
    });

    it("elapsedで特定期間内でミリ秒での期間が取得できる（覆う）", () => {
      const from = new Record("from record", new Date(2017, 1, 1, 20, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 8, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(8 * 3600 * 1000);
    });
  });

  describe("within event inverse", () => {

    const pattern = new EventPattern({
      name: "sleep",
      category: "private",
      s: "from",
      e: "to",
      withinInverse: true,
      within: {
        from: {
          hour: 21
        },
        to: {
          hour: 5
        }
      }
    });

    it("elapsedで特定期間外でミリ秒での期間が取得できる（内包、日付超えない1）", () => {
      const from = new Record("from record", new Date(2017, 1, 1, 21, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 1, 22, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(0);
    });

    it("elapsedで特定期間外でミリ秒での期間が取得できる（内包、日付超えない2）", () => {
      const from = new Record("from record", new Date(2017, 1, 2, 1, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 2, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(0);
    });
    it("elapsedで特定期間外でミリ秒での期間が取得できる（内包、日付超える）", () => {
      const from = new Record("from record", new Date(2017, 1, 1, 23, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 1, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(0);
    });

    it("elapsedで特定期間外でミリ秒での期間が取得できる（後方一部範囲内、日付超える）", () => {
      const from = new Record("from record", new Date(2017, 1, 1, 23, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 9, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(4 * 3600 * 1000);
    });

    it("elapsedで特定期間外でミリ秒での期間が取得できる（後方一部範囲内、日付超えない）", () => {
      const from = new Record("from record", new Date(2017, 1, 2, 0, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 9, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(4 * 3600 * 1000);
    });

    it("elapsedで特定期間外でミリ秒での期間が取得できる（範囲外1）", () => {
      const from = new Record("from record", new Date(2017, 1, 2, 20, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 21, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(1 * 3600 * 1000);
    });

    it("elapsedで特定期間外でミリ秒での期間が取得できる（範囲外2）", () => {
      const from = new Record("from record", new Date(2017, 1, 2, 5, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 6, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(1 * 3600 * 1000);
    });

    it("elapsedで特定期間外でミリ秒での期間が取得できる（前方一部範囲内）", () => {
      const from = new Record("from record", new Date(2017, 1, 2, 19, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 22, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(2 * 3600 * 1000);
    });

    it("elapsedで特定期間外でミリ秒での期間が取得できる（後方一部範囲内）", () => {
      const from = new Record("from record", new Date(2017, 1, 2, 4, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 7, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(2 * 3600 * 1000);
    });

    it("elapsedで特定期間外でミリ秒での期間が取得できる（覆う）", () => {
      const from = new Record("from record", new Date(2017, 1, 1, 20, 0, 0));
      const to = new Record("to record", new Date(2017, 1, 2, 8, 0, 0));
      const event = new Event(pattern, to, from);

      expect(event.elapsed).toBe(4 * 3600 * 1000);
    });
  });

});
