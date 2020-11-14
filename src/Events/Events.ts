import { Logger } from 'winston';

import Base from '../Base';
import Config from '../Types/Config';
import EventPayload from '../Types/EventPayload';
import Generic from '../Types/Generic';
import Server from '../WebSocket/Server';
import Services from '../Services/Services';

export default class Events extends Base {
  public server: Server;
  public services: Services;

  constructor(logger: Logger, config: Config) {
    super(logger, config);
    this.server = new Server(logger, config, this.onEvent);
    this.services = new Services(logger, config);
  }

  init() {
    this.logger.info('Initialise: Events');
  }

  private onEvent = async (event: EventPayload): Promise<Generic> => {
    this.logger.debug('Event');
    if (!event.serviceKey) {
      this.logger.warn('No serviceKey provided. Will not continue');
      return null;
    }
    return await this.services.runService(event);
  };
}
