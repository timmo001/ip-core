import { Core } from 'upaas-core-plugins';
import { Logger } from 'winston';

import Action from '../Types/Action';
import Base from '../Base';
import Config from '../Types/Config';
import Service from '../Types/Service';

export default class Runner extends Base {
  constructor(logger: Logger, config: Config) {
    super(logger, config);
  }

  init() {
    this.logger.info('Initialise: Runner');
  }

  runAction = async (
    service: Service,
    action: Action,
    data?: any
  ): Promise<any> => {
    this.logger.info(`${service.name} - Action: ${action.description}`);
    switch (action.service.plugin.toLowerCase()) {
      default:
        return;
      case 'core':
        const core = new Core(action.service.service);
        return await new core.service(
          data ? { ...action.parameters, data } : action.parameters
        ).run();
    }
  };
}
