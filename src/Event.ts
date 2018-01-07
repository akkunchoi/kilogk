import { Record } from "./Record";
import { EventPattern } from "./EventPattern";

export class Event {
  constructor(private pattern: EventPattern, private end: Record, private start?: Record) {

  }
}