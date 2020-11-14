import { Connection } from 'mariadb';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as YAML from 'yaml';
import moment from 'moment';
import handlebars from 'handlebars';

import Action from '../Types/Action';
import Base from '../Base';
import Config from '../Types/Config';
import Database from '../Database/Database';
import EventPayload from '../Types/EventPayload';
import Generic from '../Types/Generic';
import GenericObject from '../Types/GenericObject';
import Runner from '../Runner/Runner';
import Service from '../Types/Service';
import Variables from '../Types/Variables';

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

  async parseTemplate(variables: Variables, item: any): Promise<any> {
    if (Array.isArray(item)) {
      const arrParsed = [];
      for (let i = 0; i < item.length; i++) {
        arrParsed.push(await this.parseTemplate(variables, item[i]));
      }
      return arrParsed;
    }
    switch (typeof item) {
      case 'string':
        const hbCompiled = handlebars.compile(item)(variables);
        return isNaN(Number(hbCompiled)) ? hbCompiled : Number(hbCompiled);
      case 'object':
        const entries = Object.entries(item);
        for (let i = 0; i < entries.length; i++) {
          const [key, value] = entries[i];
          item[key] = await this.parseTemplate(variables, value);
        }
        return item;
      default:
        return item;
    }
  }

  runService = async (event: EventPayload): Promise<Generic> => {
    const id = uuidv4();

    const startedDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const connection: Connection = await this.database.pool.getConnection();
    await connection.query(
      `INSERT INTO events (id,service,status,started,updated) VALUES ('${id}','${event.serviceKey}','Started','${startedDate}','${startedDate}')`
    );

    try {
      const path = `${this.config.services_directory}${
        this.config.services_directory.endsWith('/') ? '' : '/'
      }${event.serviceKey}.yaml`;
      const data = fs.readFileSync(path, { encoding: 'utf8' });
      const service: Service = YAML.parse(data);
      if (!service) {
        this.logger.error(`Could not parse yaml file. ${path}`);
        return null;
      }
      this.logger.info(`Run Service: ${service.name} (${event.serviceKey})`);
      this.logger.debug(`Description: ${service.description}`);

      const variables: Variables = {
        config: service.config,
        db: {},
        parameters: event.data.parameters,
        headers: event.data.headers,
        body: event.data.body,
      };
      this.logger.debug(`Config: ${JSON.stringify(variables.config)}`);
      this.logger.debug(`DB: ${JSON.stringify(variables.db)}`);
      this.logger.debug(`Parameters: ${JSON.stringify(variables.parameters)}`);
      this.logger.debug(`Headers: ${JSON.stringify(variables.headers)}`);
      this.logger.debug(`Body: ${JSON.stringify(variables.body)}`);

      for (let i = 0; i < service.actions.length; i++) {
        let action: Action = service.actions[i];
        action.description = await this.parseTemplate(
          variables,
          action.description
        );
        this.logger.debug(`action.description: ${action.description}`);
        action.requires = await this.parseTemplate(variables, action.requires);
        this.logger.debug(`action.requires: ${action.requires}`);
        action.service.plugin = await this.parseTemplate(
          variables,
          action.service.plugin
        );
        this.logger.debug(`action.service.plugin: ${action.service.plugin}`);
        action.service.service = await this.parseTemplate(
          variables,
          action.service.service
        );
        this.logger.debug(`action.service.service: ${action.service.service}`);

        if (action.parameters !== undefined && action.parameters !== null) {
          let parameters: GenericObject = {};
          const entries = Object.entries(action.parameters);
          for (let i = 0; i < entries.length; i++) {
            const [key, value] = entries[i];
            parameters = {
              ...parameters,
              [key]: await this.parseTemplate(variables, value),
            };
          }
          action.parameters = parameters;
        }
        this.logger.debug(
          `action.parameters: ${JSON.stringify(action.parameters)}`
        );

        this.logger.debug(`Action (Parsed): ${JSON.stringify(action)}`);
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
      this.logger.error(err);
      await connection.query(
        `UPDATE events SET status = 'error', message = '${
          err.message
        }', updated =  '${moment().format(
          'YYYY-MM-DD HH:mm:ss'
        )}' WHERE id = '${id}'`
      );
      this.data = { errorCode: 500, message: err.message };
    }
    return this.data;
  };

  runCallback = (error: Error | null, data: any) => {
    if (error) {
      this.logger.error(error);
      return;
    }
    this.data = data;
  };
}
