import { Logger } from 'winston';

import Base from './Base';
import Events from './Events/Events';

export default class Main extends Base {
  public events: Events;

  constructor(logger: Logger) {
    super(logger);
    this.events = new Events(logger);
  }

  init() {
    this.logger.info('Hello Main');
  }
}
