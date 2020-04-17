import moment from "moment";
import { Record } from "./Record";

export class DailyLog {
  constructor(private date: Date, private _records: Record[]) {

  }
  get records(): Record[] {
    return this._records;
  }

}

