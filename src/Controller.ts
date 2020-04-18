import { KilogkRunOption, KilogkConfig, RecordType, Symbols } from "./types";
import { DailyFileRepository } from "./DailyFileRepository";
import { injectable, inject } from "inversify";
import { DailyFile } from "./DailyFile";
import { DailyLog } from "./DailyLog";
import moment from "moment";
import _ from "lodash";
import { EventDetector } from "./EventDetector";
import { DailyLogFactory } from "./DailyLogFactory";
import { Parser, ParserFactory } from "./ParserFactory";
import { Record } from "./Record";

@injectable()
export class Controller {
  private parser: Parser;
  
  constructor(
    private dailyFileRepository: DailyFileRepository,
    private parserFactory: ParserFactory,
    private eventDetector: EventDetector,
    @inject(Symbols.KilogkConfig) private config: KilogkConfig
  ) {

  }
  async loadParser() {
    return this.parser = await this.parserFactory.create();
  }

  parse(dailyFile: DailyFile): DailyLog {
    const factory = new DailyLogFactory(this.parser);

    try {
      return factory.build(dailyFile);
    } catch (err) {
      console.warn(err, dailyFile);
    }
  }

  async build(runOption: KilogkRunOption) {

    const dates = createTargetDates(runOption, this.config);

    const files = await this.dailyFileRepository.load(dates);

    await this.loadParser();

    const logs = files
      .map((file: DailyFile) => this.parse(file))
      .filter((log: DailyLog) => log);

    // 睡眠時間計測のために前日の最後のレコードを取得する
    const prevDate = moment(_.first(dates)).subtract(1, "day").toDate();
    const prevFiles = await this.dailyFileRepository.load([prevDate]);
    const prevLog = this.parse(prevFiles[0]);
    const prevRecords = _.filter(prevLog.records, (r: Record) => {
      return r.type === RecordType.TIMELY;
    });
    const prevLogLastOnly = new DailyLog(prevDate, [_.last(prevRecords)]);
    const targetLogs = [].concat([prevLogLastOnly]).concat(logs);

    const result = this.eventDetector.detect(targetLogs);

    const moreThan20HoursEvents = _.filter(result.events, (event) => {
      return event.elapsed > 20 * 3600 * 1000;
    });

    return {
      ...result,
      dates,
      targetLogs,
      moreThan20HoursEvents,
    };

  }
}

function decideTargetYear(runOption: KilogkRunOption): number {

  if (runOption.year) {
    return parseInt(runOption.year, 10);
  } else {
    return moment().get("year");
  }

}

function createTargetDates(runOption: KilogkRunOption, config: KilogkConfig): Date[] {

  const targetDateStartYear = decideTargetYear(runOption);
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
        .isoWeekday(config.startWeek)
        .toDate();
    } else {
      const weekNumber = parseInt(runOption.week, 10);
      first = moment([targetDateStartYear, 0, 1])
        .add(1, "week")
        .isoWeek(weekNumber)
        .isoWeekday(config.startWeek)
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
