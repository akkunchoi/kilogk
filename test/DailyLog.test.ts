import { DailyLog } from "../src/DailyLog";
import { Record } from "../src/Record";
import { RecordType } from "../src/types";

describe("DailyLog", () => {
  it("construct", () => {
    const log = new DailyLog(new Date(2017, 1, 1), [
      new Record("a", new Date(2017, 1, 1), RecordType.TIMELY)
    ]);
    expect(log.records[0].text).toBe("a");
  });
});
