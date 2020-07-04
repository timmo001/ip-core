import { Logger } from 'winston';

import Base from '../Base';
import Server from '../WebSocket/Server';

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

  constructor(logger: Logger) {
    super(logger);
    this.server = new Server(logger, this.onEvent);
  }

  init() {
    this.logger.info('Hello Events');
  }

  private onEvent(event: EventPayload) {
    this.logger.info('Event');
    if (event.type === 'service' && !event.serviceKey) {
      this.logger.warn('No serviceKey provided. Will not continue');
      return;
    }
    if (event.type === 'custom' && !event.data){
      this.logger.warn('No data provided for custom event. Will not continue');
      return;
    }
  }
}
