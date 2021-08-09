import Config from "./Types/Config";
import Database from "./Database";
import Logs from "./Logs";

export default class Base {
  public config: Config;
  public database: Database;
  public logs: Logs;

  constructor(config: Config, database: Database, logs: Logs) {
    this.config = config;
    this.database = database;
    this.logs = logs;
    this.init();
  }

  async init() {
    throw new Error("Method not implemented.");
  }
}
