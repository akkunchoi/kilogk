import { Record } from "./Record";
import { EventPattern } from "./EventPattern";

export class Event {
  get pattern(): EventPattern {
    return this._pattern;
  }
  constructor(private _pattern: EventPattern, private end: Record, private start?: Record) {

  }
  get elapsed(): number {
    if (this.start && this.start.datetime && this.end && this.end.datetime) {
      return this.end.datetime.getTime() - this.start.datetime.getTime();
    } else {
      console.warn("no datetime", this);
      return 0;
    }
  }
}