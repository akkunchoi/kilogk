import { DailyLogFactory } from "../src/DailyLogFactory";
import { ParserFactory } from "../src/ParserFactory";
import { DailyFile } from "../src/DailyFile";
import { Record } from "../src/Record";

describe("DiaryLogFactory", () => {

  let factory: DailyLogFactory;

  beforeEach(() => {
    return new ParserFactory().create().then((parser) => {
      factory = new DailyLogFactory(parser);
    });
  });

  describe("ビルドOK 降順の場合", () => {
    let records: Record[];
    beforeEach(() => {
      const raw = `
log 2017-01-01

* aaa

1 寝た
12 昼ごはん
10:30 朝ごはん
9:00 起きた

その他テキスト
    `;
      const file = new DailyFile(new Date(2017, 0, 1), raw);
      const log = factory.build(file);
      records = log.records;

      expect(records.length).toBe(5);
    });

    it("標準：日時、時、分の読み取り", () => {
      expect(records[0].text).toBe("起きた");
      expect(records[0].datetime).toEqual(new Date(2017, 0, 1, 9));
    });
    it("分の読み取り", () => {
      expect(records[1].text).toBe("朝ごはん");
      expect(records[1].datetime).toEqual(new Date(2017, 0, 1, 10, 30));
    });
    it("分省略", () => {
      expect(records[2].text).toBe("昼ごはん");
      expect(records[2].datetime).toEqual(new Date(2017, 0, 1, 12, 0));
    });
    it("日付超える場合", () => {
      expect(records[3].text).toBe("寝た");
      expect(records[3].datetime).toEqual(new Date(2017, 0, 2, 1, 0));
    });
    it("アノテーションテキスト", () => {
      expect(records[4].text).toBe("aaa");
      expect(records[4].datetime).toEqual(new Date(2017, 0, 1));
    });

  });

  describe("ビルドOK 昇順の場合", () => {
    let records: Record[];
    beforeEach(() => {
      const raw = `
log 2017-01-01

* aaa

9:00 起きた
10:30 朝ごはん
12 昼ごはん
1 寝た

その他テキスト
    `;
      const file = new DailyFile(new Date(2017, 0, 1), raw);
      const log = factory.build(file);
      records = log.records;
      expect(records.length).toBe(5);
    });

    it("標準：日時、時、分の読み取り", () => {
      expect(records[0].text).toBe("起きた");
      expect(records[0].datetime).toEqual(new Date(2017, 0, 1, 9));
    });
    it("分の読み取り", () => {
      expect(records[1].text).toBe("朝ごはん");
      expect(records[1].datetime).toEqual(new Date(2017, 0, 1, 10, 30));
    });
    it("分省略", () => {
      expect(records[2].text).toBe("昼ごはん");
      expect(records[2].datetime).toEqual(new Date(2017, 0, 1, 12, 0));
    });
    it("日付超える場合", () => {
      expect(records[3].text).toBe("寝た");
      expect(records[3].datetime).toEqual(new Date(2017, 0, 2, 1, 0));
    });
    it("アノテーションテキスト", () => {
      expect(records[4].text).toBe("aaa");
      expect(records[4].datetime).toEqual(new Date(2017, 0, 1));
    });

  });

  describe("ビルドNG", () => {
    let file: DailyFile;
    beforeEach(() => {
      const raw = `
hogehoge
    `;
      file = new DailyFile(new Date(2017, 0, 1), raw);
    });

    it("標準：日時、時、分の読み取り", () => {
      const log = factory.build(file);
      expect(log.records.length).toBe(0);
    });

  });

});
