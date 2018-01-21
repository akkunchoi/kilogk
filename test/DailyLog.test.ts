import { DailyLog } from "../src/DailyLog";
import { Record } from "../src/Record";

describe("DailyLog", () => {
  it("construct", () => {
    const log = new DailyLog(new Date(2017, 1, 1), [
      new Record("a")
    ]);
    expect(log.records[0].text).toBe("a");
  });
});
