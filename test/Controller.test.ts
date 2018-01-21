import { Controller } from "../src/Controller";

describe("Controller", () => {
  let controller;
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
  })
  it("", () => {
  });
});
