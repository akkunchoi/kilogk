export class EventPattern {
  private _start: RegExp;
  private _end: RegExp;
  private _allDay: RegExp;
  private _name: String;
  private _category: String;

  constructor(patternObj: any) {

    if (patternObj.name) {
      this._name = patternObj.name;
    }
    if (patternObj.category) {
      this._category = patternObj.category;
    }
    if (patternObj.s) {
      this._start = new RegExp(patternObj.s);
    }
    if (patternObj.e) {
      this._end = new RegExp(patternObj.e);
    }
    if (patternObj.a) {
      this._allDay = new RegExp(patternObj.a);
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
}