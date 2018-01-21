import { Event } from "../src/Event";
import { EventPattern } from "../src/EventPattern";
import { Record } from "../src/Record";
import { RecordType } from "../src/types";

describe("Record", () => {

  it("setMidnight", () => {
    const record = new Record("a", new Date(2017, 0, 1, 1, 0), RecordType.TIMELY);
    record.setMidnight();
    expect(record.datetime).toEqual(new Date(2017, 0, 2, 1, 0));
  });

});
