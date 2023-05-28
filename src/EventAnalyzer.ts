import { Event } from "./Event";
import * as _ from "lodash";
import { EventDetector } from "./EventDetector";
import moment = require("moment");
import { EventPatternType } from "./types";
import { injectable } from "inversify";

@injectable()
export class EventAnalyzer {
  constructor(private eventDetector: EventDetector) {

  }
  analyze(events: Event[], options?: {outputRecords: boolean, period: Date[]}) {

    options = {
      outputRecords: false,
      ...options
    };

    // TODO: MARKイベントは件数カウントにしたい
    // TODO: 全日イベントはそのまま表示したい

    const days = options.period.length;

    const patterns = this.eventDetector.getPatterns();
    const categories = _.groupBy(patterns, (pattern) => pattern.category);

    const grouped = _.groupBy(events, (event) => event.pattern.name);

    const res = _.map(grouped, (events, key) => {

      const sum = _.sumBy(events, (event) => event.elapsed);

      const hours = this.formatNumber(sum / 1000 / 3600);

      const count = events.length;

      return {key, hours, count, events};

    });

    _.forEach(categories, (patterns, category) => {
      console.log("## " + category);

      let total = 0;

      patterns.forEach((pattern) => {

        const result = res.find((r) => r.key === pattern.name);
        if (result) {
          if (pattern.total !== false) {
            total += result.hours;
          }
          if (pattern.type === EventPatternType.MARK) {
            console.log("- " + pattern.name + " " + result.count + " #");
          } else {
            const avg = this.formatNumber(result.hours / days);
            console.log(`- ${pattern.name} ${result.hours} hours. (avg ${avg})`);
          }

          if (options.outputRecords) {
            if (pattern.type === EventPatternType.ALL_DAY) {
              for (const event of result.events) {
                console.log("    " +
                  event.end.text
                );
              }
            }
            if (pattern.type === EventPatternType.START_GUESS || pattern.type === EventPatternType.START_DEFINITE) {
              for (const event of result.events) {
                console.log("    " +
                  event.end.text + " " +
                  " [ " +
                  " from " + (event.start ? moment(event.start.datetime).format("MM-DD HH:mm") : "--") +
                  " to " + moment(event.end.datetime).format("MM-DD HH:mm") + " " +
                  " elapsed " + Math.floor(event.elapsed / 1000 / 3600) +
                  " ] "
                );
              }
            }
          }
        }

      });

      const avg = this.formatNumber(total / days);
      console.log(`- TOTAL: ${this.formatNumber(total)} hours. (avg ${avg})`);
      console.log("");

    });

  }
  formatNumber(n: number): number {
    const decimal = 100;
    return Math.floor(n * decimal) / decimal;
  }
}