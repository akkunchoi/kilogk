import { Event } from "./Event";
import * as _ from "lodash";
import { EventDetector } from "./EventDetector";
import moment = require("moment");

export class EventAnalyzer {
  constructor(private eventDetector: EventDetector, private config: any) {

  }
  analyze(events: Event[]) {
    // TODO: MARKイベントは件数カウントにしたい

    const patterns = this.eventDetector.getPatterns();
    const categories = _.groupBy(patterns, (pattern) => pattern.category);

    const grouped = _.groupBy(events, (event) => event.pattern.name);

    const res = _.map(grouped, (events, key) => {

      const sum = _.sumBy(events, (event) => event.elapsed);

      const hours = this.formatNumber(sum / 1000 / 3600);
      return {key, hours};

    });

    _.forEach(categories, (patterns, category) => {
      console.log("# " + category);

      let total = 0;

      patterns.forEach((pattern) => {

        const result = res.find((r) => r.key === pattern.name);
        if (result) {
          if (pattern.total !== false) {
            total += result.hours;
          }
          console.log("- " + pattern.name + " " + result.hours + " hours.");
        }

      });

      console.log("- TOTAL: " + this.formatNumber(total) + " hours.");
      console.log("");

    });

  }
  formatNumber(n: number): number {
    const decimal = 100;
    return Math.floor(n * decimal) / decimal;
  }
}