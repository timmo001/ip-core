import { Logger } from "winston";

import Base from "./Base";
import Config from "./Types/Config";
import Database from "./Database";
import Logs from "./Logs";

export default class Conditions extends Base {
  constructor(config: Config, database: Database, logs: Logs) {
    super(config, database, logs);
  }

  async init() {
    this.logs.info("Initialise: Conditions", "core");
  }
}
