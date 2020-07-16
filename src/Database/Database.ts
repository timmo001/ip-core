import { Logger } from 'winston';
import mariadb, { Pool, Connection } from 'mariadb';

import Base from '../Base';
import Config from '../Types/Config';

export default class Database extends Base {
  public pool!: Pool;

  constructor(logger: Logger, config: Config) {
    super(logger, config);
  }

  init() {
    this.pool = mariadb.createPool({
      database: this.config.database.database,
      host: this.config.database.host,
      password: this.config.database.password,
      user: this.config.database.username,
    });
    this.createTables();
  }

  async createTables() {
    const connection: Connection = await this.pool.getConnection();
    await connection.query(
      'CREATE TABLE IF NOT EXISTS events (' +
        'id VARCHAR(36) NOT NULL UNIQUE PRIMARY KEY,' +
        'service VARCHAR(36) NOT NULL,' +
        'status VARCHAR(52) NOT NULL,' +
        'started DATETIME NOT NULL,' +
        'updated DATETIME NOT NULL,' +
        'completed DATETIME,' +
        'message VARCHAR(255))' +
        'WITH SYSTEM VERSIONING PARTITION BY SYSTEM_TIME (' +
        'PARTITION events_history HISTORY,' +
        'PARTITION events_current CURRENT' +
        ');'
    );
  }
}
