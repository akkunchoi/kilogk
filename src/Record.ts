import * as moment from "moment";

export class Record {
  private midnight = false;
  constructor(private text: string, private datetime?: moment.Moment) {
  }
  compare(r: Record): number {
    if (this.datetime.isAfter(r.datetime)) {
      return -1;
    } else if (this.datetime.isBefore(r.datetime)) {
      return 1;
    } else {
      return 0;
    }
  }
  setMidnight() {
    this.midnight = true;
    this.datetime.add(1, "day");
  }
}
