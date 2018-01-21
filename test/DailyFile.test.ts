import { DailyFile } from "../src/DailyFile";

describe("DailyFile", () => {
  it("construct", () => {
    const file = new DailyFile(new Date(2017, 1, 1), "raw text");
    expect(file.date).toBeDefined();
    expect(file.raw).toBeDefined();
  });
});
