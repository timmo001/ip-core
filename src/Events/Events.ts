import { Logger } from 'winston';

import Base from '../Base';
import Server from '../WebSocket/Server';

export interface ServiceEventData {
  [key: string]: any;
}

export interface EventPayload {
  event: 'service' | 'custom';
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
    this.logger.info('onEvent');
  }
}
