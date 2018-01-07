import { Event } from "./Event";

export class EventAnalyzer {
  constructor(private config: any) {

  }
  analyze(events: Event[]) {

    console.log(events);

  }
}