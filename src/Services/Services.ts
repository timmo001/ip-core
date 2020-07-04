import { Logger } from 'winston';
import * as fs from 'fs';
import * as YAML from 'yaml';

import Base from '../Base';
import Config from '../Types/Config';
import GenericObject from '../Types/GenericObject';
import Service from '../Types/Service';

export default class Services extends Base {
  constructor(logger: Logger, config: Config) {
    super(logger, config);
  }

  init() {
    this.logger.info('Initialise: Services');
  }

  runService = (serviceKey: string, data?: GenericObject) => {
    const path = `${this.config.services_directory}${
      this.config.services_directory.endsWith('/') ? '' : '/'
    }${serviceKey}.yaml`;
    fs.readFile(
      path,
      { encoding: 'utf8' },
      (err: NodeJS.ErrnoException | null, data: string) => {
        if (err) {
          this.logger.warn(`Error reading ${path}`);
          this.logger.warn(err);
          return;
        }
        const service: Service = YAML.parse(data);
        if (!service) {
          this.logger.warn(`Could not parse yaml file. ${path}`);
          return;
        }
        this.logger.info(`Run Service: ${service.name} (${serviceKey})`);
        this.logger.info(`Description: ${service.description}`);
      }
    );
  };

  runCustomService = (data: GenericObject) => {
    this.logger.info('Run Custom Service');
  };
}
