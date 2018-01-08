import { EventPatternType, TimeSpan } from "./types";

export class EventPattern {
  private _start: RegExp;
  private _end: RegExp;
  private _allDay: RegExp;
  private _name: String;
  private _category: String;
  private _type: EventPatternType;
  private _total: boolean;
  private _within: TimeSpan;
  private _withinInverse: boolean;

  constructor(patternObj: any) {

    if (patternObj.name) {
      this._name = patternObj.name;
    }
    if (patternObj.category) {
      this._category = patternObj.category;
    }

    this._type = EventPatternType.ANNOTATION;


    if (patternObj.e) {
      this._end = new RegExp(patternObj.e);
      this._type = EventPatternType.START_GUESS;
    }
    if (patternObj.s) {
      this._start = new RegExp(patternObj.s);
      this._type = EventPatternType.START_DEFINITE;
    }
    if (patternObj.a) {
      this._allDay = new RegExp(patternObj.a);
      this._type = EventPatternType.ALL_DAY;
    }

    if ("total" in patternObj) {
      this._total = patternObj.total;
    }
    if (patternObj.within) {
      this._within = patternObj.within;
    }
    if (patternObj.withinInverse) {
      this._withinInverse = patternObj.withinInverse;
    }
  }

  get start(): RegExp {
    return this._start;
  }

  get end(): RegExp {
    return this._end;
  }

  get allDay(): RegExp {
    return this._allDay;
  }

  get name(): String {
    return this._name;
  }

  get category(): String {
    return this._category;
  }

  get type(): EventPatternType {
    return this._type;
  }

  get total(): boolean {
    return this._total;
  }
  get within(): TimeSpan {
    return this._within;
  }
  get withinInverse(): boolean {
    return this._withinInverse;
  }
}