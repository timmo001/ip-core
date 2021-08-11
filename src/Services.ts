import { join } from "path";
import { parse } from "yaml";
import { readFileSync } from "fs";
import { Repository } from "typeorm";
import handlebars from "handlebars";

import { EventEntity } from "./entities/event.entity";
import Action from "./Types/Action";
import Base from "./Base";
import Config from "./Types/Config";
import Database from "./Database";
import EventPayload from "./Types/EventPayload";
import Generic from "./Types/Generic";
import GenericObject from "./Types/GenericObject";
import Logs from "./Logs";
import Runner from "./Runner";
import Service from "./Types/Service";
import Variables from "./Types/Variables";

export default class Services extends Base {
  private data: any;
  private eventRepo: Repository<EventEntity>;
  private runner: Runner;

  constructor(config: Config, database: Database, logs: Logs) {
    super(config, database, logs);
    this.runner = new Runner(config, database, logs);
    this.eventRepo = this.database.connection.getRepository(EventEntity);
  }

  async init() {
    this.logs.info("Initialise: Services", "services");
    handlebars.registerHelper(
      "json",
      (context) => new handlebars.SafeString(JSON.stringify(context))
    );
  }

  async parseTemplate(variables: Variables, item: any): Promise<any> {
    if (Array.isArray(item)) {
      const arrParsed = [];
      for (let i = 0; i < item.length; i++) {
        arrParsed.push(await this.parseTemplate(variables, item[i]));
      }
      return arrParsed;
    }
    switch (typeof item) {
      case "string":
        const hbCompiled = handlebars.compile(item)(variables);
        if (!isNaN(Number(hbCompiled))) return Number(hbCompiled);
        if (hbCompiled.includes("{") || hbCompiled.includes("[")) {
          try {
            return JSON.parse(hbCompiled);
          } catch (e) {
            return hbCompiled;
          }
        }
        return hbCompiled;
      case "object":
        const entries = Object.entries(item);
        for (let i = 0; i < entries.length; i++) {
          const [key, value] = entries[i];
          item[key] = await this.parseTemplate(variables, value);
        }
        return item;
      default:
        return item;
    }
  }

  runService = async (event: EventPayload): Promise<Generic> => {
    const dbEvent = this.eventRepo.create({
      service: event.serviceKey,
      endpoint: event.endpointKey,
      status: "Started",
    });
    await this.eventRepo.save(dbEvent);

    try {
      const path = join(
        this.config.services_directory,
        `${event.serviceKey}.yml`
      );
      const data = readFileSync(path, { encoding: "utf8" });
      const service: Service = parse(data);
      if (!service) {
        this.logs.error(`Could not parse yaml file. ${path}`, "service");
        return null;
      }
      this.logs.info(
        `Run Service: ${service.name} (${event.serviceKey})`,
        "service"
      );
      this.logs.debug(`Description: ${service.description}`, "service");

      const variables: Variables = {
        body: event.data.body,
        config: service.config,
        db: {},
        headers: event.data.headers,
        parameters: event.data.parameters,
        results: {},
      };
      this.logs.debug(`Config: ${JSON.stringify(variables.config)}`, "service");
      this.logs.debug(`DB: ${JSON.stringify(variables.db)}`, "service");
      this.logs.debug(
        `Parameters: ${JSON.stringify(variables.parameters)}`,
        "service"
      );
      this.logs.debug(
        `Headers: ${JSON.stringify(variables.headers)}`,
        "service"
      );
      this.logs.debug(`Body: ${JSON.stringify(variables.body)}`, "service");

      for (let i = 0; i < service.actions.length; i++) {
        let action: Action = service.actions[i];
        this.logs.info(
          `Run Action: ${action.description} (${action.id})`,
          "serviceAction"
        );
        action.description = await this.parseTemplate(
          variables,
          action.description
        );
        this.logs.debug(
          `action.description: ${action.description}`,
          "serviceActoin"
        );
        action.requires = await this.parseTemplate(variables, action.requires);
        this.logs.debug(`action.requires: ${action.requires}`, "serviceAction");
        action.service.plugin = await this.parseTemplate(
          variables,
          action.service.plugin
        );
        this.logs.debug(
          `action.service.plugin: ${action.service.plugin}`,
          "serviceAction"
        );
        action.service.service = await this.parseTemplate(
          variables,
          action.service.service
        );
        this.logs.debug(
          `action.service.service: ${action.service.service}`,
          "serviceAction"
        );

        if (action.parameters !== undefined && action.parameters !== null) {
          let parameters: GenericObject = {};
          const entries = Object.entries(action.parameters);
          for (let i = 0; i < entries.length; i++) {
            const [key, value] = entries[i];
            parameters = {
              ...parameters,
              [key]: await this.parseTemplate(variables, value),
            };
          }
          action.parameters = parameters;
        }
        this.logs.debug(
          `action.parameters: ${JSON.stringify(action.parameters)}`,
          "serviceAction"
        );
        this.data = await this.runner.runAction(
          dbEvent.id,
          service,
          action,
          action.requires === "previous" ? this.data : undefined
        );
        variables.results[action.id] = this.data;
      }
      await this.eventRepo.update(dbEvent.id, {
        status: "Completed",
        message: JSON.stringify(this.data),
      });
    } catch (err) {
      this.logs.error(err, "service");
      await this.eventRepo.update(dbEvent.id, {
        status: "Error",
        message: JSON.stringify(err.message),
      });
      this.data = { errorCode: 500, message: err.message };
    }
    return this.data;
  };

  runCallback = (error: Error | null, data: any) => {
    if (error) {
      this.logs.error(error.message, "serviceCallback");
      return;
    }
    this.data = data;
  };
}
