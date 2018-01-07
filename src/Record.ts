import * as moment from "moment";

export class Record {
  private midnight = false;
  constructor(private text: string, private datetime: Date) {
  }
  compare(r: Record): number {
    if (moment(this.datetime).isAfter(r.datetime)) {
      return -1;
    } else if (moment(this.datetime).isBefore(r.datetime)) {
      return 1;
    } else {
      return 0;
    }
  }
  setMidnight() {
    this.midnight = true;
    this.datetime = moment(this.datetime).add(1, "day").toDate();
  }
}
