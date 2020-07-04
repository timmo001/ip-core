import { Logger } from 'winston';

import Base from '../Base';

export default class Outputs extends Base {
  constructor(logger: Logger) {
    super(logger);
  }

  init() {
    this.logger.info('Hello Outputs');
  }
}
