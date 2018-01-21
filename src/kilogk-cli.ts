/**
 *
 * kilogk-cli --year 2018                # 2018年 年間
 * kilogk-cli --year 2018 --month 1      # 2018年1月 月間
 * kilogk-cli --year 2018 --week 1       # 2018年の第１週 週間
 * kilogk-cli --week last                # 先週 週間
 *
 *
 *
 *
 */

import * as dotenv from "dotenv";
import * as minimist from "minimist";

dotenv.config({ path: ".env" });

const argv = minimist(process.argv.slice(2));

import { Controller } from "./Controller";
Controller.fromArgv(argv).then(() => {
  console.log("Done.");
}).catch((err) => {
  console.error(err);
});
