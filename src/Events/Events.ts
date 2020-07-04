import { Logger } from 'winston';

import Base from '../Base';
import Config from '../Types/Config';
import EventPayload from 'src/Types/EventPayload';
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

  private onEvent = (event: EventPayload) => {
    this.logger.info('Event');
    if (event.type === 'service') {
      if (!event.serviceKey) {
        this.logger.warn('No serviceKey provided. Will not continue');
        return;
      }
      this.services.runService(event.serviceKey, event.data);
    }
    if (event.type === 'custom') {
      if (!event.data) {
        this.logger.warn(
          'No data provided for custom event. Will not continue'
        );
        return;
      }
      this.services.runCustomService(event.data);
    }
  };
}
