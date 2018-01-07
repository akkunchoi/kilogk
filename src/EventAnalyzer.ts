import { Event } from "./Event";
import * as _ from "lodash";
import { EventDetector } from "./EventDetector";

export class EventAnalyzer {
  constructor(private eventDetector: EventDetector, private config: any) {

  }
  analyze(events: Event[]) {

    const grouped = _.groupBy(events, (event) => event.pattern.name);

    _.forEach(grouped, (events, key) => {

      const sum = _.sumBy(events, (event) => event.elapsed);
      let a = 100;
      let hour = Math.floor(sum / 1000 / 3600 * a) / a;
      console.log(key, hour);

    });


  }
}