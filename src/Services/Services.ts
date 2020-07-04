import { Logger } from 'winston';
import * as fs from 'fs';
import * as YAML from 'yaml';
import { Core } from 'upaas-core-plugins';
import { CorePayload } from 'upaas-core-plugins/lib/Types';

import Base from '../Base';
import Config from '../Types/Config';
import GenericObject from '../Types/GenericObject';
import Service from '../Types/Service';
import Action from 'src/Types/Action';

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
        this.logger.debug(`Description: ${service.description}`);
        service.actions.map((action: Action) => {
          const payload: CorePayload = {
            service: action.service.service,
            data: action.data,
          };
          switch (action.service.plugin.toLowerCase()) {
            default:
              break;
            case 'core':
              const core = new Core(payload);
              new core.service(core.payload.data).run(this.runCallback);
              break;
          }
        });
      }
    );
  };

  runCallback = (error: Error | null, data: any) => {
    if (error) {
      this.logger.error(error);
      return;
    }
    this.logger.info(JSON.stringify(data));
  };
}
