import { DailyLog } from "./DailyLog";
import { Record } from "./Record";
import { Event } from "./Event";
import { EventPattern } from "./EventPattern";
import * as _ from "lodash";

export class EventDetector {
  constructor(private config: any) {

  }
  getPatterns(): EventPattern[] {
    return this.config.patterns.map((patternObj: any) => new EventPattern(patternObj));
  }

  detect(logs: DailyLog[]) {

    const records = logs.reduce((records: Record[], log: DailyLog) => {
      return records.concat(log.records);
    }, []);

    // TODO 重複の検出

    const patterns = this.getPatterns();

    const events: Event[] = [];

    const matchedStartPatternRecords: {pattern: EventPattern, record: Record}[] = [];
    let lastRecord: Record;

    for (const record of records) {

      // 全日マッチ
      patterns
        .filter((pattern: EventPattern) => {
          if (pattern.allDay) {
            if (pattern.allDay.test(record.text)) {
              return true;
            }
          }
        })
        .forEach((pattern) => {
          events.push(new Event(pattern, record));
        });

      // 開始マッチ
      patterns
        .filter((pattern: EventPattern) => {
          if (pattern.start) {
            if (pattern.start.test(record.text)) {
              return true;
            }
          }
        })
        .forEach((pattern) => {
          matchedStartPatternRecords.push({
            pattern: pattern,
            record: record
          });
        });

      // 終了マッチ
      patterns
        .filter((pattern: EventPattern) => {
          if (pattern.end) {
            if (pattern.end.test(record.text)) {
              return true;
            }
          }
        })
        .forEach((pattern) => {

          const matched = matchedStartPatternRecords.find((pr) => pr.pattern === pattern);
          if (matched) {
            // 開始特定期間イベントの場合
            events.push(new Event(matched.pattern, record, matched.record));
            _.pull(matchedStartPatternRecords, matched);
          } else {
            // 開始推定期間イベント
            events.push(new Event(pattern, record, lastRecord));
          }
        });

      lastRecord = record;

    }

    return events;

  }
}