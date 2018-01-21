import * as moment from "moment";
import { RecordType } from "./types";

export class Record {
  private _midnight = false;
  private _hash: string;
  constructor(private _text: string, private _datetime: Date, private _type: RecordType) {
    this._hash = Record.number() + "_" + this._datetime.getTime() + this._text;
  }
  compare(r: Record): number {
    if (moment(this._datetime).isAfter(r._datetime)) {
      return -1;
    } else if (moment(this._datetime).isBefore(r._datetime)) {
      return 1;
    } else {
      return 0;
    }
  }
  setMidnight() {
    this._midnight = true;
    this._datetime = moment(this._datetime).add(1, "day").toDate();
  }

  get text(): string {
    return this._text;
  }
  get datetime(): Date {
    return this._datetime;
  }
  get hash(): string {
    return this._hash;
  }
  get type(): RecordType {
    return this._type;
  }
  static _number: number = 0;
  static number(): number {
    return ++Record._number;
  }
}
