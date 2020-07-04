import { Logger } from 'winston';

import Base from '../Base';

export default class Transformations extends Base {
  constructor(logger: Logger) {
    super(logger);
  }

  init() {
    this.logger.info('Hello Transformations');
  }
}
