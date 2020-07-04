import { Logger } from 'winston';

import Base from '../Base';
import Server from '../WebSocket/Server';
import Services from '../Services/Services';

export interface ServiceEventData {
  [key: string]: any;
}

// { "type": "service", "serviceKey": "1234", "data": {} }
export interface EventPayload {
  type: 'service' | 'custom';
  serviceKey?: string;
  data?: ServiceEventData;
}

export default class Events extends Base {
  public server: Server;
  public services: Services;

  constructor(logger: Logger) {
    super(logger);
    this.server = new Server(logger, this.onEvent);
    this.services = new Services(logger);
  }

  init() {
    this.logger.info('Hello Events');
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
