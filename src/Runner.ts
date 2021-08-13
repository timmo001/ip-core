import { Core } from "ip-core-plugins";
import { Repository } from "typeorm";

import { EventEntity } from "./entities/event.entity";
import Action from "./Types/Action";
import Base from "./Base";
import Config from "./Types/Config";
import Database from "./Database";
import Generic from "./Types/Generic";
import Logs from "./Logs";
import Service from "./Types/Service";

export default class Runner extends Base {
  private eventRepo: Repository<EventEntity>;

  constructor(config: Config, database: Database, logs: Logs) {
    super(config, database, logs);
    this.eventRepo = this.database.connection.getRepository(EventEntity);
  }

  async init() {
    this.logs.info("Initialise: Runner", "runner");
  }

  runAction = async (
    id: string,
    service: Service,
    action: Action,
    data?: any
  ): Promise<Generic> => {
    await this.eventRepo.update(id, {
      status: `Running - ${action.description}`,
    });

    this.logs.info(`${service.name} - Action: ${action.description}`, "action");
    switch (action.service.plugin.toLowerCase()) {
      default:
        return null;
      case "core":
        const core = new Core(action.service.service);
        return await new core.service(
          data ? { ...action.parameters, data } : action.parameters
        ).run();
    }
  };
}
