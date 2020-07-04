import { Logger } from 'winston';

import Base from '../Base';
import { ServiceEventData } from 'src/Events/Events';

export default class Services extends Base {
  constructor(logger: Logger) {
    super(logger);
  }

  init() {
    this.logger.info('Hello Services');
  }

  runService = (serviceKey: string, data?: ServiceEventData) => {
    this.logger.info(`Run Service: ${serviceKey}`);
  };

  runCustomService = (data: ServiceEventData) => {
    this.logger.info('Run Custom Service');
  };
}
