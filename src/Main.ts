import Base from "./Base";
import Config from "./Types/Config";
import Database from "./Database";
import Events from "./Events";
import Logs from "./Logs";

export default class Main extends Base {
  public events: Events;

  constructor(config: Config, database: Database, logs: Logs) {
    super(config, database, logs);
    this.events = new Events(config, database, logs);
  }

  async init() {
    this.logs.info("Initialise: Main", "main");
  }
}
