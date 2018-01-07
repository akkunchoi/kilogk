import * as fs from "fs-extra";
import * as moment from "moment";
import * as _ from "lodash";

import { Record } from "./Record";
import { DailyRecord } from "./DailyRecord";

const parser = require("./parser");

export default function (): Promise<any> {
  interface KilogkConfig {
    source: {
      path: string;
      filename: string;
      format: string;
    };
    startWeek: number;
  }

  type Week = Date[];

  class DayFile {
    constructor(public raw?: string) {
    }
  }

  type LexicalParsedLine = {
    type: string,
    date: {
      year: string,
      month: string,
      day: string
    },
    time: {
      hour: string,
      minute: string,
    },
    chars: string
  };
  type LexicalParsed = LexicalParsedLine[];

  class DailyLog {
    constructor(private date: moment.Moment, private records: Record[], private dailyRecords: DailyRecord[]) {

    }
  }
  // 全日イベントもレコードとparser (2).jsしていったん扱うようにする？
  class DailyLogFactory {
    build(parsed: LexicalParsed): DailyLog {

      const header = _.find(parsed, {type: "header"});
      const headerDate = this.buildDatetimeFromParsedLine(header);

      const records = _.filter(parsed, {type: "record"}).map((r) => {
        return new Record(r.chars, this.buildDatetimeFromParsedLine(r, headerDate));
      });
      const dailyRecords = _.filter(parsed, {type: "daily"}).map((r) => {
        return new DailyRecord(r.chars);
      });

      // レコード順序を特定
      // orderCountが負の場合、降順に並んでいるので、昇順に並び替える。
      let prev: Record|null = undefined;
      let orderCount = 0;
      for (const r of records) {
        if (prev) {
          orderCount += prev.compare(r);
        }
        prev = r;
      }

      if (orderCount <= 0) {
        records.reverse();
      }

      // 日付が変わる瞬間を特定し、+1日する
      prev = undefined;
      let tomorrow = false;
      for (const r of records) {
        if (prev) {
          if (prev.compare(r) === -1) {
            tomorrow = true;
          }
          if (tomorrow) {
            r.setMidnight();
          }
        }
        prev = r;
      }

      return new DailyLog(headerDate, records, dailyRecords);
    }
    buildDatetimeFromParsedLine(line: LexicalParsedLine, baseDate?: moment.Moment): moment.Moment {
      let date;
      if (baseDate) {
        date = baseDate.clone();
      } else if (line.date) {
        date = moment([line.date.year, line.date.month, line.date.day].join("-"));
      }

      if (line.time) {
        date.hours(parseInt(line.time.hour, 10)).minutes(parseInt(line.time.minute, 10));
      }

      return date;
    }
  }

  class Event {

  }

  class Kilogk {
    constructor(private config: KilogkConfig) {

    }

    async start(): Promise<any> {
      return this.hoge();
    }
    async hoge(): Promise<any> {
      const week = this.createWeek();
      const files = await this.loadFiles(week);

      const a = this.parse(files[0]);
      console.log(a);
    }
    
    createWeek(firstDay: Date = new Date()): Week {
      const lastMonday = moment(firstDay).startOf("week").isoWeekday(this.config.startWeek);
      return [0, 1, 2, 3, 4, 5, 6, 7].map((number: number) => {
        return lastMonday.clone().add(number, "days").toDate();
      });
    }
    
    async loadFiles(week: Week): Promise<DayFile[]> {
      const recordPromises = week.map((date) => {
        const path = this.config.source.path;
        const filename = this.config.source.filename;
        const filepath = path + filename.replace("%date%", moment(date).format(this.config.source.format));
        
        return fs.ensureFile(filepath).then(() => {
          return fs.readFile(filepath, "utf-8").then((result: string) => {
            return new DayFile(result);
          });
        }, () => {
          return new DayFile();
        });
      });
      
      return Promise.all(recordPromises);
    }

    lexer(str: string): LexicalParsed {
      let parsed = undefined;

      try {
      } catch (e) {
        console.warn(e);
      } finally {
        parsed = parser.parse(str);
      }
      return parsed;
    }
    parse(dayFile: DayFile) {
      const str = dayFile.raw;

      const factory = new DailyLogFactory();
      return factory.build(this.lexer(str));
    }
  }

  const kilogk = new Kilogk({
    source: {
      path: "/Users/akiyoshi/Library/Application Support/Notational Data/",
      filename: "log %date%.txt",
      format: "YYYY-MM-DD"
    },
    startWeek: 1
  });

  return kilogk.start();
}

