import * as moment from "moment";
import * as _ from "lodash";
import * as fs from "fs-extra";
import * as yaml from "js-yaml";

const debug = require("debug")("kilogk");

import { Record } from "./Record";
import { DailyLogFactory } from "./DailyLogFactory";
import { DailyLog } from "./DailyLog";
import { DailyFile } from "./DailyFile";
import { EventDetector } from "./EventDetector";
import { EventAnalyzer } from "./EventAnalyzer";
import { KilogkConfig, KilogkRunOption, RecordType, TargetDate } from "./types";
import { DailyFileRepository } from "./DailyFileRepository";
import { ConfigRepository } from "./ConfigRepository";

export class Controller {
  private dailyFileRepository: DailyFileRepository;

  constructor(private config: KilogkConfig) {
    this.dailyFileRepository = new DailyFileRepository(this.config.source);
  }

  async start(runOption: KilogkRunOption): Promise<any> {

    const dates = this.createTargetDates(runOption);
    const files = await this.dailyFileRepository.load(dates);

    const logs = files
      .map((file) => this.parse(file))
      .filter((file) => file);

    // 睡眠時間計測のために前日の最後のレコードを取得する
    const prevDate = moment(_.first(dates)).subtract(1, "day").toDate();
    const prevFiles = await this.dailyFileRepository.load([prevDate]);
    const prevLog = this.parse(prevFiles[0]);
    const prevRecords = _.filter(prevLog.records, (r: Record) => {
      return r.type === RecordType.TIMELY;
    });
    const prevLogLastOnly = new DailyLog(prevDate, [_.last(prevRecords)]);
    const targetLogs = [].concat([prevLogLastOnly]).concat(logs);

    const eventDetector = new EventDetector(this.config.eventDetector);
    const result = eventDetector.detect(targetLogs);

    const moreThan20HoursEvents = _.filter(result.events, (event) => {
      return event.elapsed > 20 * 3600 * 1000;
    });

    if (moreThan20HoursEvents.length > 0) {
      console.log("Warning: more than 20 hours");
      for (const event of moreThan20HoursEvents) {
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

    console.log("TargetDates: ");
    console.log(
      moment(_.first(dates)).format(),
      moment(_.last(dates)).format(),
    );
    console.log("");

    console.log("Events: ");
    const eventAnalyzer = new EventAnalyzer(eventDetector, this.config.eventAnalyzer);
    eventAnalyzer.analyze(result.events, {outputRecords: runOption.outputRecords});
    console.log("");

    if (runOption.outputRecords) {
      console.log("Isolations: ");
      for (const record of result.isolations) {
        console.log(record.datetime, record.text);
      }
      console.log("");
    }

  }

  decideTargetYear(runOption: KilogkRunOption): number {

    if (runOption.year) {
      return parseInt(runOption.year, 10);
    } else {
      return moment().get("year");
    }

  }

  createTargetDates(runOption: KilogkRunOption): Date[] {

    const targetDateStartYear = this.decideTargetYear(runOption);
    let first: Date;
    let mode: ("year"|"month"|"week") = "year";

    // 何も指定していない場合は先週
    if (!runOption.year && !runOption.month && !runOption.week) {
      runOption.week = "last";
    }

    if (runOption.month) {
      const month = parseInt(runOption.month, 10) - 1;
      first = moment([targetDateStartYear, month, 1]).toDate();
      mode = "month";
    } else if (runOption.year) {
      first = moment([targetDateStartYear, 0, 1]).toDate();
    }

    if (runOption.week) {
      if (runOption.week === "last") {
        first = moment()
          .startOf("day")
          .subtract(1, "week")
          .isoWeekday(this.config.startWeek)
          .toDate();
      } else {
        const weekNumber = parseInt(runOption.week, 10);
        first = moment([targetDateStartYear, 0, 1])
          .add(1, "week")
          .isoWeek(weekNumber)
          .isoWeekday(this.config.startWeek)
          .toDate();
      }
      mode = "week";
    }

    const d: moment.Moment = moment(first);
    const to: Date = moment(first).add(1, mode).toDate();
    const targetDates: Date[] = [];
    while (true) {
      targetDates.push(d.toDate());
      d.add(1, "day");
      if (d.isSameOrAfter(to)) break;
    }
    return targetDates;
  }

  parse(dailyFile: DailyFile): DailyLog {
    const factory = new DailyLogFactory();

    try {
      return factory.build(dailyFile);
    } catch (err) {
      console.warn(err, dailyFile);
    }
  }

  static async fromArgv(runOption: any): Promise<any> {

    const configRepository = new ConfigRepository({
      path: process.env.KK_CONFIG || "./config/config.yml"
    });

    const config = await configRepository.load();

    debug("config", config);

    const ctrl = new Controller(config);

    return ctrl.start({
      year: runOption.year,
      month: runOption.month,
      week: runOption.week,
      outputRecords: runOption.outputRecords
    });

  }
}

