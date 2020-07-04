import { Logger } from 'winston';

export default class Base {
  public logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
    this.init();
  }

  init() {
    throw new Error('Method not implemented.');
  }
}
