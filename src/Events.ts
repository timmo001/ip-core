import Base from './Base';
import Config from './Types/Config';
import Database from './Database';
import EventPayload from './Types/EventPayload';
import Generic from './Types/Generic';
import Logs from './Logs';
import Server from './WebSocket/Server';
import Services from './Services';

export default class Events extends Base {
  public server: Server;
  public services: Services;

  constructor(config: Config, database: Database, logs: Logs) {
    super(config, database, logs);
    this.server = new Server(config, database, logs, this.onEvent);
    this.services = new Services(config, database, logs);
  }

  async init() {
    this.logs.info('Initialise: Events', 'events');
  }

  private onEvent = async (event: EventPayload): Promise<Generic> => {
    this.logs.debug('Event', 'event');
    if (!event.serviceKey) {
      this.logs.warn('No serviceKey provided. Will not continue', 'event');
      return null;
    }
    return await this.services.runService(event);
  };
}
