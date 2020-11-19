import { Core } from 'upaas-core-plugins';
import moment from 'moment';

import Action from './Types/Action';
import Base from './Base';
import Config from './Types/Config';
import Database from './Database';
import Generic from './Types/Generic';
import Logs from './Logs';
import Service from './Types/Service';

export default class Runner extends Base {
  constructor(config: Config, database: Database, logs: Logs) {
    super(config, database, logs);
  }

  async init() {
    this.logs.info('Initialise: Runner', 'runner');
  }

  runAction = async (
    id: string,
    service: Service,
    action: Action,
    data?: any
  ): Promise<Generic> => {
    await this.database.connection.query(
      `UPDATE events SET status = "Running - ${
        action.description
      }", updatedOn = '${moment().format(
        'YYYY-MM-DD HH:mm:ss'
      )}' WHERE id = '${id}'`
    );

    this.logs.info(`${service.name} - Action: ${action.description}`, 'action');
    switch (action.service.plugin.toLowerCase()) {
      default:
        return null;
      case 'core':
        const core = new Core(action.service.service);
        return await new core.service(
          data ? { ...action.parameters, data } : action.parameters
        ).run();
    }
  };
}
