import { inject, injectable } from "inversify";

import { DailyFile } from "./DailyFile";
import fs from "fs-extra";
import moment from "moment";
import { DailyFileRepositoryConfig, Symbols, TargetDate } from "./types";

@injectable()
export class DailyFileRepository {

  constructor(@inject(Symbols.DailyFileRepositoryConfig) private config: DailyFileRepositoryConfig) {
  }

  async load(week: TargetDate): Promise<DailyFile[]> {
    const recordPromises = week.map((date) => {
      const path = this.config.path;
      const filename = this.config.filename;
      const filepath = path + filename.replace("%date%", moment(date).format(this.config.format));

      return fs.pathExists(filepath).then(() => {
        return fs.readFile(filepath, "utf-8").then((result: string) => {
          return new DailyFile(date, result);
        });
      }, () => {
        return new DailyFile(date);
      });
    });

    return Promise.all(recordPromises);
  }

}