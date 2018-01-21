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
  ALL_DAY = "ALL_DAY",
  ANNOTATION = "ANNOTATION",
  START_DEFINITE = "START_DEFINITE",
  START_GUESS = "START_GUESS"
}

export interface KilogkRunOption {
  year: string | undefined;
  month: string | undefined;
  week: string | undefined;
}

export interface KilogkConfig {
  source: {
    path: string;
    filename: string;
    format: string;
  };
  startWeek: number; // 1-7 @see https://momentjs.com/docs/#/get-set/iso-weekday/
  eventDetector: {
  };
  eventAnalyzer: {
  };
}

export type TargetDate = Date[];
