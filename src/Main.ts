import { Logger } from 'winston';

import Base from './Base';
import Config from './Types/Config';
import Events from './Events/Events';

export default class Main extends Base {
  public events: Events;

  constructor(logger: Logger, config: Config) {
    super(logger, config);
    this.events = new Events(logger, config);
  }

  init() {
    this.logger.info('Initialise: Main');
  }
}
