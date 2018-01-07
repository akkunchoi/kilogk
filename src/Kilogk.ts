import * as fs from "fs-extra";
import * as moment from "moment";
import * as _ from "lodash";
import * as yaml from "js-yaml";

import { DailyLogFactory } from "./DailyLogFactory";
import { DailyLog } from "./DailyLog";
import { DailyFile } from "./DailyFile";
import { EventDetector } from "./EventDetector";
import { EventAnalyzer } from "./EventAnalyzer";

const debug = require("debug")("kilogk");

export default function (): Promise<any> {
  interface KilogkConfig {
    source: {
      path: string;
      filename: string;
      format: string;
    };
    startWeek: number; // 1-7 @see https://momentjs.com/docs/#/get-set/iso-weekday/
    eventDetector: {
    };
    eventAnalyzer: {
    };
  }

  type Week = Date[];

  class Event {

  }

  class Kilogk {
    constructor(private config: KilogkConfig) {

    }

    async start(): Promise<any> {
      return this.hoge();
    }
    async hoge(): Promise<any> {
      const week = this.createWeek();
      const files = await this.loadFiles(week);

      const logs = files
        .map((file) => this.parse(file))
        .filter((file) => file);

      const eventDetector = new EventDetector(this.config.eventDetector);
      const events = eventDetector.detect(logs);

      const eventAnalyzer = new EventAnalyzer(eventDetector, this.config.eventAnalyzer);
      eventAnalyzer.analyze(events);

    }
    
    createWeek(firstDay: Date = new Date()): Week {
      const lastMonday = moment(firstDay).startOf("week").isoWeekday(this.config.startWeek);
      return [0, 1, 2, 3, 4, 5, 6, 7].map((number: number) => {
        return lastMonday.clone().add(number, "days").toDate();
      });
    }
    
    async loadFiles(week: Week): Promise<DailyFile[]> {
      const recordPromises = week.map((date) => {
        const path = this.config.source.path;
        const filename = this.config.source.filename;
        const filepath = path + filename.replace("%date%", moment(date).format(this.config.source.format));
        
        return fs.ensureFile(filepath).then(() => {
          return fs.readFile(filepath, "utf-8").then((result: string) => {
            return new DailyFile(date, result);
          });
        }, () => {
          return new DailyFile(date);
        });
      });
      
      return Promise.all(recordPromises);
    }

    parse(dailyFile: DailyFile): DailyLog {
      const factory = new DailyLogFactory();

      try {
        return factory.build(dailyFile);
      } catch (err) {
        console.warn(err, dailyFile);
      }
    }

  }

  const configPath = process.env.KK_CONFIG || "./config/config.yml";

  return fs.readFile(configPath, "utf-8").then((result: string) => {
    const doc = yaml.safeLoad(result);

    debug("config", doc);

    const kilogk = new Kilogk(doc);

    return kilogk.start();

  });

}

