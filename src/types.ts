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