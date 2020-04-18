import "reflect-metadata";

import moment from "moment";
import _ from "lodash";
import fs from "fs-extra";
import yaml from "js-yaml";

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
import Main from "./Main";
import { Controller } from "./Controller";

export class Application {
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
    this.container.bind<Controller>(Controller).toSelf();
  }

  async start(runOption: KilogkRunOption): Promise<any> {
    return Main(runOption, this.container);
  }

  // async _start(runOption: KilogkRunOption): Promise<any> {
  //   debug("runOption");
  //   debug(runOption);

  //   const dailyFileRepository = this.container.get<DailyFileRepository>(DailyFileRepository);

  //   const dates = this.createTargetDates(runOption);
  //   const files = await dailyFileRepository.load(dates);

  //   await this.loadParser();

  //   const logs = files
  //     .map((file: DailyFile) => this.parse(file))
  //     .filter((log: DailyLog) => log);

  //   // 睡眠時間計測のために前日の最後のレコードを取得する
  //   const prevDate = moment(_.first(dates)).subtract(1, "day").toDate();
  //   const prevFiles = await dailyFileRepository.load([prevDate]);
  //   const prevLog = this.parse(prevFiles[0]);
  //   const prevRecords = _.filter(prevLog.records, (r: Record) => {
  //     return r.type === RecordType.TIMELY;
  //   });
  //   const prevLogLastOnly = new DailyLog(prevDate, [_.last(prevRecords)]);
  //   const targetLogs = [].concat([prevLogLastOnly]).concat(logs);

  //   const eventDetector = this.container.get<EventDetector>(EventDetector);
  //   const result = eventDetector.detect(targetLogs);

  //   const moreThan20HoursEvents = _.filter(result.events, (event) => {
  //     return event.elapsed > 20 * 3600 * 1000;
  //   });

    
  //   if (runOption.outputRecords) {
  //     targetLogs.forEach((targetLog: DailyLog) => {
  //       targetLog.records.forEach((record: Record) => {
  //         console.log(moment(record.datetime).format(), record.text);
  //       });
  //     });
  //   }

  //   if (runOption.outputEvents) {
  //     result.events.forEach((event) => {
  //       console.log("" +
  //         (event.start ? moment(event.start.datetime).format("MM/DD HH:mm") : "-----------") +
  //         " to " + moment(event.end.datetime).format("MM/DD HH:mm") + " " +
  //         " ( " + Math.floor(event.elapsed / 1000 / 3600) + " ) " +
  //         event.end.text + " " +
  //         ""
  //       );
  //     });
  //   }

  //   if (moreThan20HoursEvents.length > 0) {
  //     console.log("Warning: more than 20 hours");
  //     for (const event of moreThan20HoursEvents) {
  //       console.log("    " +
  //         event.end.text + " " +
  //         " [ " +
  //         " from " + (event.start ? moment(event.start.datetime).format("MM/DD HH:mm") : "--") +
  //         " to " + moment(event.end.datetime).format("MM/DD HH:mm") + " " +
  //         " elapsed " + Math.floor(event.elapsed / 1000 / 3600) +
  //         " ] "
  //       );
  //     }
  //   }

  //   console.log("TargetDates: ");
  //   console.log(
  //     moment(_.first(dates)).format(),
  //     moment(_.last(dates)).format(),
  //   );
  //   console.log("");

  //   console.log("Events: ");
  //   const eventAnalyzer = this.container.get<EventAnalyzer>(EventAnalyzer);
  //   eventAnalyzer.analyze(result.events, {outputRecords: runOption.outputRecords, period: dates});
  //   console.log("");

  //   if (runOption.outputIsolations) {
  //     console.log("Isolations: ");
  //     for (const record of result.isolations) {
  //       console.log(moment(record.datetime).format(), record.text);
  //     }
  //     console.log("");
  //   }

  // }

  static async fromArgv(runOption: any): Promise<any> {

    const configRepository = new ConfigRepository({
      path: process.env.KK_CONFIG || "./config/config.yml"
    });

    const config = await configRepository.load();

    debug("config", config);

    const ctrl = new Application(config);

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

