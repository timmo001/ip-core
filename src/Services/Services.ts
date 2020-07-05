import { Logger } from 'winston';
import * as fs from 'fs';
import * as YAML from 'yaml';

import Action from '../Types/Action';
import Base from '../Base';
import Config from '../Types/Config';
import Runner from '../Runner/Runner';
import Service from '../Types/Service';

export default class Services extends Base {
  data: any;
  runner: Runner;

  constructor(logger: Logger, config: Config) {
    super(logger, config);
    this.runner = new Runner(logger, config);
  }

  init() {
    this.logger.info('Initialise: Services');
  }

  runService = async (serviceKey: string) => {
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
          service,
          action,
          action.requires === 'previous' ? this.data : undefined
        );
        this.logger.debug(
          `${service.name} - Action: ${action.description} - this.data post: ${this.data}`
        );
      }
    } catch (err) {
      this.logger.warn(err);
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
