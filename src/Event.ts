import { Record } from "./Record";
import { EventPattern } from "./EventPattern";
import { TimeSpan } from "./types";
import moment = require("moment");
import * as _ from "lodash";

export class Event {
  get pattern(): EventPattern {
    return this._pattern;
  }
  constructor(private _pattern: EventPattern, private end: Record, private start?: Record) {

  }

  get elapsed(): number {

    const elapsed = this.getElapsed();

    if (this._pattern.within) {

      const elapsedWithin = this.getElapsedWithin(this._pattern.within);

      if (this._pattern.withinInverse) {
        return elapsed - elapsedWithin;
      } else {
        return elapsedWithin;
      }

    } else {
      return elapsed;
    }

  }

  getElapsed() {
    if (this.start && this.start.datetime && this.end && this.end.datetime) {
      return this.end.datetime.getTime() - this.start.datetime.getTime();
    } else {
      console.warn("no datetime", this);
      return 0;
    }
  }
  getElapsedWithin(within: TimeSpan): number {
    /**
     *  WS: within-start
     *  WE: within-end
     *  ES: event-start
     *  EE: event-end
     *
     *  WS ---- WE ---- ES ---- EE
     *  WS **** ES **** WE ---- EE
     *  WS ---- ES **** EE ---- WE
     *  ES ---- WS **** WE ---- EE
     *  ES ---- WS **** EE **** WE
     *  ES ---- EE ---- WS ---- WE
     *
     */

    const startHour = moment(this.start.datetime).get("hour");
    const prevDayFlag = startHour < within.to.hour;
    const ws = moment(this.start.datetime)
      .startOf("day")
      .set("hour", within.from.hour)
      .subtract(prevDayFlag ? 1 : 0, "day")
      .toDate();
    
    const nextDayFlag = within.from.hour > within.to.hour;
    const we = moment(this.start.datetime)
      .startOf("day")
      .set("hour", within.to.hour)
      .add(nextDayFlag && !prevDayFlag ? 1 : 0, "day")
      .toDate();

    const from = moment.max(moment(this.start.datetime), moment(ws));
    const to = moment.min(moment(this.end.datetime), moment(we));

    if (from.isBefore(to)) {

      // console.log(
      //   moment(this.start.datetime).format(),
      //   moment(this.end.datetime).format(),
      //   moment(ws).format(),
      //   moment(we).format(),
      //   from.format(),
      //   to.format(),
      //   (to.toDate().getTime() - from.toDate().getTime()) / 3600 / 1000
      // );
      return to.toDate().getTime() - from.toDate().getTime();
    } else {
      return 0;
    }

  }
}