import { createConnection, Connection } from "typeorm";
import { Logger } from "winston";

import { EventEntity } from "./entities/event.entity";
import { LogEntity } from "./entities/log.entity";
import Config from "./Types/Config";

export default class Database {
  public connection!: Connection;

  private config: Config;
  private logger: Logger;

  constructor(config: Config, logger: Logger, callback: () => void) {
    this.config = config;
    this.logger = logger;
    this.init().then(callback);
  }

  async init() {
    this.logger.info("Initialise: Database");
    this.connection = await createConnection({
      ...this.config.database,
      entities: [EventEntity, LogEntity],
      synchronize: false,
    });
  }
}
