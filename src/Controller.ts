import * as moment from "moment";
import * as _ from "lodash";
import * as fs from "fs-extra";
import * as yaml from "js-yaml";

const debug = require("debug")("kilogk");

import { DailyLogFactory } from "./DailyLogFactory";
import { DailyLog } from "./DailyLog";
import { DailyFile } from "./DailyFile";
import { EventDetector } from "./EventDetector";
import { EventAnalyzer } from "./EventAnalyzer";
import { KilogkConfig, KilogkRunOption, TargetDate } from "./types";
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

    const eventDetector = new EventDetector(this.config.eventDetector);
    const events = eventDetector.detect(logs);

    const eventAnalyzer = new EventAnalyzer(eventDetector, this.config.eventAnalyzer);
    eventAnalyzer.analyze(dates, events);

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
          .isoWeekday(this.config.startWeek)
          .subtract(1, "week")
          .startOf("week")
          .toDate();
      } else {
        first = moment([targetDateStartYear])
          .isoWeek(parseInt(runOption.week, 10))
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
      if (d.isAfter(to)) break;
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
    });

  }
}

