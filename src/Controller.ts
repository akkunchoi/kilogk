import "reflect-metadata";

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
import {
  DailyFileRepositoryConfig, EventDetectorConfig, KilogkConfig, KilogkRunOption, RecordType, Symbols,
  TargetDate
} from "./types";
import { DailyFileRepository } from "./DailyFileRepository";
import { ConfigRepository } from "./ConfigRepository";
import { ParserFactory, Parser } from "./ParserFactory";

import { Container } from "inversify";

export class Controller {
  private parser: Parser;
  private parserFactory: ParserFactory;
  private container: Container;

  constructor(private config: KilogkConfig) {
    this.container = new Container();
    this.container.bind<KilogkConfig>(Symbols.KilogkConfig).toConstantValue(config);
    this.container.bind<DailyFileRepositoryConfig>(Symbols.DailyFileRepositoryConfig).toConstantValue(config.source);
    this.container.bind<EventDetectorConfig>(Symbols.EventDetectorConfig).toConstantValue(config.eventDetector);
    this.container.bind<DailyFileRepository>(DailyFileRepository).toSelf();
    this.container.bind<EventDetector>(EventDetector).toSelf();
    this.container.bind<EventAnalyzer>(EventAnalyzer).toSelf();
    this.container.bind<ParserFactory>(ParserFactory).toSelf();
  }

  async start(runOption: KilogkRunOption): Promise<any> {
    debug("runOption");
    debug(runOption);

    const dailyFileRepository = this.container.get<DailyFileRepository>(DailyFileRepository);

    const dates = this.createTargetDates(runOption);
    const files = await dailyFileRepository.load(dates);

    await this.loadParser();

    const logs = files
      .map((file: DailyFile) => this.parse(file))
      .filter((log: DailyLog) => log);

    // 睡眠時間計測のために前日の最後のレコードを取得する
    const prevDate = moment(_.first(dates)).subtract(1, "day").toDate();
    const prevFiles = await dailyFileRepository.load([prevDate]);
    const prevLog = this.parse(prevFiles[0]);
    const prevRecords = _.filter(prevLog.records, (r: Record) => {
      return r.type === RecordType.TIMELY;
    });
    const prevLogLastOnly = new DailyLog(prevDate, [_.last(prevRecords)]);
    const targetLogs = [].concat([prevLogLastOnly]).concat(logs);

    const eventDetector = this.container.get<EventDetector>(EventDetector);
    const result = eventDetector.detect(targetLogs);

    const moreThan20HoursEvents = _.filter(result.events, (event) => {
      return event.elapsed > 20 * 3600 * 1000;
    });

    if (runOption.outputRecords) {
      targetLogs.forEach((targetLog: DailyLog) => {
        targetLog.records.forEach((record: Record) => {
          console.log(moment(record.datetime).format(), record.text);
        });
      });
    }

    if (runOption.outputEvents) {
      result.events.forEach((event) => {
        console.log("" +
          (event.start ? moment(event.start.datetime).format("MM/DD HH:mm") : "-----------") +
          " to " + moment(event.end.datetime).format("MM/DD HH:mm") + " " +
          " ( " + Math.floor(event.elapsed / 1000 / 3600) + " ) " +
          event.end.text + " " +
          ""
        );
      });
    }

    if (moreThan20HoursEvents.length > 0) {
      console.log("Warning: more than 20 hours");
      for (const event of moreThan20HoursEvents) {
        console.log("    " +
          event.end.text + " " +
          " [ " +
          " from " + (event.start ? moment(event.start.datetime).format("MM/DD HH:mm") : "--") +
          " to " + moment(event.end.datetime).format("MM/DD HH:mm") + " " +
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

    const eventAnalyzer = this.container.get<EventAnalyzer>(EventAnalyzer);
    eventAnalyzer.analyze(result.events, {outputRecords: runOption.outputRecords, period: dates});
    console.log("");

    if (runOption.outputIsolations) {
      console.log("Isolations: ");
      for (const record of result.isolations) {
        console.log(moment(record.datetime).format(), record.text);
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
    const factory = new DailyLogFactory(this.parser);

    try {
      return factory.build(dailyFile);
    } catch (err) {
      console.warn(err, dailyFile);
    }
  }

  async loadParser() {
    this.parserFactory = this.container.get(ParserFactory);
    return this.parser = await this.parserFactory.create();
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
      outputRecords: runOption.outputRecords,
      outputEvents: runOption.outputEvents,
      outputIsolations: runOption.outputIsolations
    });

  }
}

