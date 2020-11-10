import { Connection } from 'mariadb';
import { Core } from 'upaas-core-plugins';
import { Logger } from 'winston';
import moment from 'moment';

import Action from '../Types/Action';
import Base from '../Base';
import Config from '../Types/Config';
import Generic from '../Types/Generic';
import Service from '../Types/Service';

export default class Runner extends Base {
  constructor(logger: Logger, config: Config) {
    super(logger, config);
  }

  init() {
    this.logger.info('Initialise: Runner');
  }

  runAction = async (
    id: string,
    connection: Connection,
    service: Service,
    action: Action,
    data?: any
  ): Promise<Generic> => {
    await connection.query(
      `UPDATE events SET status = "Running - ${
        action.description
      }", updated = '${moment().format(
        'YYYY-MM-DD HH:mm:ss'
      )}' WHERE id = '${id}'`
    );

    this.logger.info(`${service.name} - Action: ${action.description}`);
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
