import { DailyFileRepository } from "./DailyFileRepository";

export interface TimeSpan {
  from: {
    hour: number;
  };
  to: {
    hour: number;
  };
}

// Enum
export enum EventPatternType {
  IGNORE = "IGNORE",
  ALL_DAY = "ALL_DAY",
  MARK = "MARK",
  START_DEFINITE = "START_DEFINITE",
  START_GUESS = "START_GUESS"
}

export interface KilogkRunOption {
  year: string | undefined;
  month: string | undefined;
  week: string | undefined;
}

export interface DailyFileRepositoryConfig {
  path: string;
  filename: string;
  format: string;
}

export interface KilogkConfig {
  source: DailyFileRepositoryConfig;
  startWeek: number; // 1-7 @see https://momentjs.com/docs/#/get-set/iso-weekday/
  eventDetector: {
  };
  eventAnalyzer: {
  };
}

export type TargetDate = Date[];

export enum RecordType {
  TIMELY = "TIMELY",
  DAILY = "DAILY"
}
