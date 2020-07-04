import { Logger } from 'winston';

import Config from './Types/Config';

export default class Base {
  public logger: Logger;
  public config: Config;

  constructor(logger: Logger, config: Config) {
    this.logger = logger;
    this.config = config;
    this.init();
  }

  init() {
    throw new Error('Method not implemented.');
  }
}
