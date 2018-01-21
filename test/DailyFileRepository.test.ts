import { DailyFileRepository } from "../src/DailyFileRepository";

describe("DailyFileRepository", () => {

  let repository: DailyFileRepository;
  beforeEach(() => {
    repository = new DailyFileRepository({
      path: __dirname + "/source/", // required end slash
      filename: "%date%.txt",
      format: "YYYY-MM-DD"
    });
  })

  it("load", () => {

    expect.assertions(1);

    return repository.load([new Date(2017, 0, 1)]).then((files) => {
      expect(files.length).toBe(1);
    });

  });

});
