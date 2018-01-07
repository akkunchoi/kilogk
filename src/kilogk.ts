import * as fs from "fs-extra";
import * as moment from "moment";
import * as _ from "lodash";

import { DailyLogFactory } from "./DailyLogFactory";

export default function (): Promise<any> {
  interface KilogkConfig {
    source: {
      path: string;
      filename: string;
      format: string;
    };
    startWeek: number;
  }

  type Week = Date[];

  class DayFile {
    constructor(public raw?: string) {
    }
  }

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

      const a = this.parse(files[0]);
      console.log(a);
    }
    
    createWeek(firstDay: Date = new Date()): Week {
      const lastMonday = moment(firstDay).startOf("week").isoWeekday(this.config.startWeek);
      return [0, 1, 2, 3, 4, 5, 6, 7].map((number: number) => {
        return lastMonday.clone().add(number, "days").toDate();
      });
    }
    
    async loadFiles(week: Week): Promise<DayFile[]> {
      const recordPromises = week.map((date) => {
        const path = this.config.source.path;
        const filename = this.config.source.filename;
        const filepath = path + filename.replace("%date%", moment(date).format(this.config.source.format));
        
        return fs.ensureFile(filepath).then(() => {
          return fs.readFile(filepath, "utf-8").then((result: string) => {
            return new DayFile(result);
          });
        }, () => {
          return new DayFile();
        });
      });
      
      return Promise.all(recordPromises);
    }

    parse(dayFile: DayFile) {
      const factory = new DailyLogFactory();
      return factory.build(dayFile.raw);
    }
  }

  const kilogk = new Kilogk({
    source: {
      path: "/Users/akiyoshi/Library/Application Support/Notational Data/",
      filename: "log %date%.txt",
      format: "YYYY-MM-DD"
    },
    startWeek: 1
  });

  return kilogk.start();
}

