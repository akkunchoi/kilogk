import { DailyRecord } from "./DailyRecord";
import * as moment from "moment";
import { Record } from "./Record";

export class DailyLog {
  constructor(private date: moment.Moment, private records: Record[], private dailyRecords: DailyRecord[]) {

  }
}

