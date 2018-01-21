import { Controller } from "./Controller";
import * as fs from "fs-extra";
import * as yaml from "js-yaml";
import { KilogkConfig } from "./types";

export class ConfigRepository {
  constructor(private config: {path: string}) {

  }
  async load(): Promise<KilogkConfig> {
    const configPath = process.env.KK_CONFIG || "./config/config.yml";

    return fs.readFile(configPath, "utf-8").then((result: string) => {
      return <KilogkConfig>yaml.safeLoad(result);
    });

  }
}