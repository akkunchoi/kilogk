import * as fs from "fs-extra";
import * as yaml from "js-yaml";
const debug = require("debug")("kilogk");
import { Controller } from "./Controller";

export default function (runOption: any): Promise<any> {

  const configPath = process.env.KK_CONFIG || "./config/config.yml";

  return fs.readFile(configPath, "utf-8").then((result: string) => {
    const doc = yaml.safeLoad(result);

    debug("config", doc);

    const kilogk = new Controller(doc);

    return kilogk.start({
      year: runOption.year,
      month: runOption.month,
      week: runOption.week,
    });

  });

}

