import { Logger } from "winston";
import { v4 as uuidv4 } from "uuid";
import moment, { relativeTimeThreshold } from "moment";
import { Repository } from "typeorm";

import { LogEntity } from "./entities/log.entity";
import Config from "./Types/Config";
import Database from "./Database";

export default class Logs {
  private config: Config;
  private database: Database;
  private logger: Logger;
  private logRepo: Repository<LogEntity>;

  constructor(config: Config, database: Database, logger: Logger) {
    this.config = config;
    this.database = database;
    this.logger = logger;
    this.logRepo = this.database.connection.getRepository(LogEntity);
    this.init();
  }

  async init() {
    this.info("Initialise: Logs", "core");
  }

  private async insertLog(text: string, level: string, type: string) {
    const log: LogEntity = this.logRepo.create({ text, level, type });
    await this.logRepo.save(log);
    // this.database.connection.query(
    //   `INSERT INTO logs (id, text, level, type, createdOn) VALUES ('${uuidv4()}','${text}','${level}','${type}','${moment().format(
    //     'YYYY-MM-DD HH:mm:ss'
    //   )}')`
    // );
  }

  public debug(text: string, type: string) {
    if (this.config.core.log_level === "debug") {
      this.logger.debug(text);
      this.insertLog(text, "debug", type);
    }
  }

  public info(text: string, type: string) {
    if (
      this.config.core.log_level === "debug" ||
      this.config.core.log_level === "info"
    ) {
      this.logger.info(text);
      this.insertLog(text, "info", type);
    }
  }

  public warn(text: string, type: string) {
    if (
      this.config.core.log_level === "debug" ||
      this.config.core.log_level === "info" ||
      this.config.core.log_level === "warn"
    ) {
      this.logger.warn(text);
      this.insertLog(text, "warning", type);
    }
  }

  public error(text: string, type: string) {
    if (
      this.config.core.log_level === "debug" ||
      this.config.core.log_level === "info" ||
      this.config.core.log_level === "warn" ||
      this.config.core.log_level === "error"
    ) {
      this.logger.error(text);
      this.insertLog(text, "error", type);
    }
  }
}
