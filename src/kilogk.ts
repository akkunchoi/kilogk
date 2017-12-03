import * as fs from "fs-extra";
import * as moment from "moment";

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

  class Record {
    
  }
  class DayFile {
    constructor(public raw?: string) {
    }
  }
  class Kilogk {
    constructor(private config: KilogkConfig) {
    }

    async start(): Promise<any> {
      return this.hoge();
    }
    async hoge(): Promise<any> {
      const week = this.createWeek();
      const records = await this.loadFiles(week);
      this.parse(records[0]);
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
      const str = dayFile.raw;
      
      let day: string; 
      const records: Array<[string, string, string]> = [];
      
      str.split("\n").forEach((line) => {
        const dayMatcher = /^log (\d{4}-\d{2}-\d{2})/;
        const recordMatcher = /^(\d{1,2})(?::(\d{1,2}))?\s+(.*)$/;

        const dayMatched = line.match(dayMatcher);
        if (dayMatched) {
          day = dayMatched[1];
        }
        const recordMatched = line.match(recordMatcher);
        if (recordMatched) {
          records.push([recordMatched[1], recordMatched[2], recordMatched[3]]);
        }
      });
      
      return records.map((record) => {
        
      });
      
    }
  }

  const kilogk = new Kilogk({
    source: {
      path: "/Users/akiyoshi/Documents/nvALT/",
      filename: "log %date%.txt",
      format: "YYYY-MM-DD"
    },
    startWeek: 1
  });

  return kilogk.start();
}

