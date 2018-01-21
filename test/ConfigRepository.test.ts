import { ConfigRepository } from "../src/ConfigRepository";

describe("ConfigRepository", () => {
  let repository: ConfigRepository;
  beforeEach(() => {
    repository = new ConfigRepository({path: "./config/config.yml"});
  })

  it("load", () => {

    expect.assertions(1);

    return repository.load().then((result) => {
      expect(result.startWeek).toBe(1);
    });

  });

});
