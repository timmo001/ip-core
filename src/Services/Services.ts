import { Connection } from 'mariadb';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as YAML from 'yaml';
import moment from 'moment';

import Action from '../Types/Action';
import Base from '../Base';
import Config from '../Types/Config';
import Database from '../Database/Database';
import Runner from '../Runner/Runner';
import Service from '../Types/Service';

export default class Services extends Base {
  data: any;
  runner: Runner;
  database: Database;

  constructor(logger: Logger, config: Config) {
    super(logger, config);
    this.runner = new Runner(logger, config);
    this.database = new Database(logger, config);
  }

  async init() {
    this.logger.info('Initialise: Services');
  }

  runService = async (serviceKey: string) => {
    const id = uuidv4();

    const startedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const connection: Connection = await this.database.pool.getConnection();
    await connection.query(
      `INSERT INTO events (id,service,status,started,updated) VALUES ('${id}','${serviceKey}','Started','${startedDate}','${startedDate}')`
    );

    try {
      const path = `${this.config.services_directory}${
        this.config.services_directory.endsWith('/') ? '' : '/'
      }${serviceKey}.yaml`;
      const data = fs.readFileSync(path, { encoding: 'utf8' });
      const service: Service = YAML.parse(data);
      if (!service) {
        this.logger.warn(`Could not parse yaml file. ${path}`);
        return;
      }
      this.logger.info(`Run Service: ${service.name} (${serviceKey})`);
      this.logger.debug(`Description: ${service.description}`);
      for (let i = 0; i < service.actions.length; i++) {
        const action: Action = service.actions[i];
        this.logger.debug(
          `${service.name} - Action: ${action.description} - this.data pre: ${this.data}`
        );
        this.data = await this.runner.runAction(
          id,
          connection,
          service,
          action,
          action.requires === 'previous' ? this.data : undefined
        );
        this.logger.debug(
          `${service.name} - Action: ${action.description} - this.data post: ${this.data}`
        );
      }
      const completeDate = moment().format('YYYY-MM-DD HH:mm:ss');
      await connection.query(
        `UPDATE events SET status = 'Completed', updated = '${completeDate}', completed = '${completeDate}' WHERE id = '${id}'`
      );
    } catch (err) {
      this.logger.warn(err);
      await connection.query(
        `UPDATE events SET status = 'error', message = '${
          err.message
        }', updated =  '${moment().format(
          'YYYY-MM-DD HH:mm:ss'
        )}' WHERE id = '${id}'`
      );
    }
  };

  runCallback = (error: Error | null, data: any) => {
    if (error) {
      this.logger.error(error);
      return;
    }
    this.data = data;
  };
}
