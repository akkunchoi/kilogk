import * as moment from "moment";

export class Record {
  private _midnight = false;
  constructor(private _text: string, private _datetime: Date) {
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
}
