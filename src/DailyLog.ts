import { DailyRecord } from "./DailyRecord";
import * as moment from "moment";
import { Record } from "./Record";

export class DailyLog {
  constructor(private date: Date, private _records: Record[], private dailyRecords: DailyRecord[]) {

  }
  get records(): Record[] {
    return this._records;
  }

}

