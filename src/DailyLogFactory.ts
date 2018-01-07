const parser = require("./parser");

import { DailyRecord } from "./DailyRecord";
import { DailyLog } from "./DailyLog";
import * as moment from "moment";
import { Record } from "./Record";
import * as _ from "lodash";
import { DailyFile } from "./DailyFile";

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

class DailyLogParseError extends Error {
  public name = "DailyLogParseError";
}

export class DailyLogFactory {
  constructor() {

  }
  build(dailyFile: DailyFile): DailyLog {

    const text = dailyFile.raw;

    if (!text || text.length === 0) {
      return new DailyLog(dailyFile.date, [], []);
    }

    const parsed = this.lexer(text);

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
  buildDatetimeFromParsedLine(line: LexicalParsedLine, baseDate?: Date): Date {
    let date: moment.Moment;

    if (baseDate) {
      date = moment(baseDate);
    } else if (line.date) {
      date = moment([line.date.year, line.date.month, line.date.day].join("-"));
    }

    if (line.time) {
      date.hours(parseInt(line.time.hour, 10)).minutes(parseInt(line.time.minute, 10));
    }

    return date.toDate();
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
}

