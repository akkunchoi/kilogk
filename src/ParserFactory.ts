import { inject, injectable } from "inversify";
import fs from "fs-extra";
import { Symbols, KilogkConfig } from "./types";
const peg = require("pegjs");

export interface Parser {
  parse(): any;
}

@injectable()
export class ParserFactory {
  private pegFile: string;

  constructor(@inject(Symbols.KilogkConfig) private config?: KilogkConfig) {
    this.pegFile = __dirname + "/../config/diary.pegjs";
  }

  async create(): Promise<Parser> {

    const pegSource = await fs.readFile(this.pegFile);
    return peg.generate(pegSource.toString());

  }

}