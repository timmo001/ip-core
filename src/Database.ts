import { Logger } from 'winston';
import mariadb, { Pool, Connection } from 'mariadb';

import Config from './Types/Config';

export default class Database {
  public connection!: Connection;

  private config: Config;
  private logger: Logger;
  private pool!: Pool;

  constructor(config: Config, logger: Logger, callback: () => void) {
    this.config = config;
    this.logger = logger;
    this.init().then(callback);
  }

  async init() {
    this.logger.info('Initialise: Database');
    this.pool = mariadb.createPool({
      database: this.config.database.database,
      host: this.config.database.host,
      password: this.config.database.password,
      user: this.config.database.username,
    });
    this.connection = await this.pool.getConnection();
    await this.createTables();
  }

  async createTables() {
    this.logger.debug('Create events table');
    await this.connection.query(
      'CREATE TABLE IF NOT EXISTS events (' +
        'id VARCHAR(36) NOT NULL UNIQUE PRIMARY KEY, ' +
        'service VARCHAR(36) NOT NULL, ' +
        'endpoint VARCHAR(36), ' +
        'status VARCHAR(52) NOT NULL, ' +
        'message VARCHAR(2048), ' +
        'startedOn DATETIME NOT NULL, ' +
        'updatedOn DATETIME NOT NULL, ' +
        'completedOn DATETIME);'
    );
    this.logger.debug('Create logs table');
    await this.connection.query(
      'CREATE TABLE IF NOT EXISTS logs (' +
        'id VARCHAR(36) NOT NULL UNIQUE PRIMARY KEY, ' +
        'text VARCHAR(2048) NOT NULL, ' +
        'level VARCHAR(128) NOT NULL, ' +
        'type VARCHAR(128) NOT NULL, ' +
        'createdOn DATETIME NOT NULL);'
    );
  }
}
