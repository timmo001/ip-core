import { Logger } from 'winston';

import Base from '../Base';
import Config from '../Types/Config';

export default class Conditions extends Base {
  constructor(logger: Logger, config: Config) {
    super(logger, config);
  }

  init() {
    this.logger.info('Initialise: Conditions');
  }
}
