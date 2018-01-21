import { Controller } from "../src/Controller";
import { KilogkRunOption } from "../src/types";
import * as sinon from "sinon";
import { SinonFakeTimers } from "sinon";

function fakeTimer(date: Date) {
  let clock: SinonFakeTimers;
  beforeAll(() => {
    clock = sinon.useFakeTimers(date.getTime());
  });
  afterAll(() => {
    clock.restore();
  });
}

describe("Controller", () => {

  let controller: Controller;

  beforeEach(() => {
    controller = new Controller({
      source: {
        path: "",
        filename: "",
        format: ""
      },
      startWeek: 1,
      eventDetector: {},
      eventAnalyzer: {}
    });
  });

  describe("decideTargetYear", () => {

    fakeTimer(new Date(2017, 0, 1));

    it("returns specified year", () => {
      const runOption = <KilogkRunOption>{
        year: "2000"
      };
      expect(controller.decideTargetYear(runOption)).toBe(2000);
    });

    it("returns now", () => {
      const runOption = <KilogkRunOption>{
      };
      expect(controller.decideTargetYear(runOption)).toBe(2017);
    });

  });

  describe("createTargetDates", () => {

    describe("week:last on saturday", () => {
      fakeTimer(new Date(2016, 11, 31));

      it("returns last week", () => {
        const runOption = <KilogkRunOption>{
          week: "last"
        };
        expect(controller.createTargetDates(runOption)).toEqual([
          new Date(2016, 11, 19),
          new Date(2016, 11, 20),
          new Date(2016, 11, 21),
          new Date(2016, 11, 22),
          new Date(2016, 11, 23),
          new Date(2016, 11, 24),
          new Date(2016, 11, 25),
        ]);
      });
    });

    describe("week:last on sunday", () => {
      fakeTimer(new Date(2017, 0, 1));

      it("returns last week", () => {
        const runOption = <KilogkRunOption>{
          week: "last"
        };
        expect(controller.createTargetDates(runOption)).toEqual([
          new Date(2016, 11, 19),
          new Date(2016, 11, 20),
          new Date(2016, 11, 21),
          new Date(2016, 11, 22),
          new Date(2016, 11, 23),
          new Date(2016, 11, 24),
          new Date(2016, 11, 25),
        ]);
      });
    });
    describe("week: last on monday", () => {
      fakeTimer(new Date(2017, 0, 2));

      it("returns last week", () => {
        const runOption = <KilogkRunOption>{
          week: "last"
        };
        expect(controller.createTargetDates(runOption)).toEqual([
          new Date(2016, 11, 26),
          new Date(2016, 11, 27),
          new Date(2016, 11, 28),
          new Date(2016, 11, 29),
          new Date(2016, 11, 30),
          new Date(2016, 11, 31),
          new Date(2017, 0, 1),
        ]);
      });
    });

    describe("week option", () => {
      fakeTimer(new Date(2016, 0, 1));

      it("returns week #52 of 2016", () => {
        const runOption = <KilogkRunOption>{
          week: "52",
          year: "2016"
        };
        expect(controller.createTargetDates(runOption)).toEqual([
          new Date(2016, 11, 26),
          new Date(2016, 11, 27),
          new Date(2016, 11, 28),
          new Date(2016, 11, 29),
          new Date(2016, 11, 30),
          new Date(2016, 11, 31),
          new Date(2017, 0, 1),
        ]);
      });

      it("returns week #1 of 2017", () => {
        const runOption = <KilogkRunOption>{
          week: "1",
          year: "2017"
        };
        expect(controller.createTargetDates(runOption)).toEqual([
          new Date(2017, 0, 2),
          new Date(2017, 0, 3),
          new Date(2017, 0, 4),
          new Date(2017, 0, 5),
          new Date(2017, 0, 6),
          new Date(2017, 0, 7),
          new Date(2017, 0, 8),
        ]);
      });

      it("returns week #2 of 2017", () => {
        const runOption = <KilogkRunOption>{
          week: "2",
          year: "2017"
        };
        expect(controller.createTargetDates(runOption)).toEqual([
          new Date(2017, 0, 9),
          new Date(2017, 0, 10),
          new Date(2017, 0, 11),
          new Date(2017, 0, 12),
          new Date(2017, 0, 13),
          new Date(2017, 0, 14),
          new Date(2017, 0, 15),
        ]);
      });

      it("returns week #52 of 2017", () => {
        const runOption = <KilogkRunOption>{
          week: "52",
          year: "2017"
        };
        expect(controller.createTargetDates(runOption)).toEqual([
          new Date(2017, 11, 25),
          new Date(2017, 11, 26),
          new Date(2017, 11, 27),
          new Date(2017, 11, 28),
          new Date(2017, 11, 29),
          new Date(2017, 11, 30),
          new Date(2017, 11, 31),
        ]);
      });
    });

    describe("month option", () => {
      fakeTimer(new Date(2017, 0, 1));

      it("returns Jan of 2017", () => {
        const runOption = <KilogkRunOption>{
          month: "1"
        };
        expect(controller.createTargetDates(runOption)).toEqual([
          new Date(2017, 0, 1),
          new Date(2017, 0, 2),
          new Date(2017, 0, 3),
          new Date(2017, 0, 4),
          new Date(2017, 0, 5),
          new Date(2017, 0, 6),
          new Date(2017, 0, 7),
          new Date(2017, 0, 8),
          new Date(2017, 0, 9),
          new Date(2017, 0, 10),
          new Date(2017, 0, 11),
          new Date(2017, 0, 12),
          new Date(2017, 0, 13),
          new Date(2017, 0, 14),
          new Date(2017, 0, 15),
          new Date(2017, 0, 16),
          new Date(2017, 0, 17),
          new Date(2017, 0, 18),
          new Date(2017, 0, 19),
          new Date(2017, 0, 20),
          new Date(2017, 0, 21),
          new Date(2017, 0, 22),
          new Date(2017, 0, 23),
          new Date(2017, 0, 24),
          new Date(2017, 0, 25),
          new Date(2017, 0, 26),
          new Date(2017, 0, 27),
          new Date(2017, 0, 28),
          new Date(2017, 0, 29),
          new Date(2017, 0, 30),
          new Date(2017, 0, 31),
        ]);
      });
    });


  });

});
