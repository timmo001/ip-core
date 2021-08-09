import { createLogger, format, transports } from "winston";

import Config from "./Types/Config";
import Database from "./Database";
import Logs from "./Logs";
import Main from "./Main";
import { parse } from "yaml";
import { readFileSync } from "fs";
import { join } from "path";

export function getAppDataDirectory() {
  return join(
    process.env.APP_PATH ||
      process.env.APPDATA ||
      (process.platform == "darwin"
        ? process.env.HOME + "/Library/Preferences"
        : process.env.HOME + "/.local/share"),
    "ip-data"
  );
}

const config: Config = parse(
  readFileSync(join(getAppDataDirectory(), "config.yml"), "utf8")
);

const logger = createLogger({
  level: config.core.log_level,
  format: format.combine(
    format.colorize(),
    format.json(),
    format.simple(),
    format.splat()
  ),
  transports: [new transports.Console()],
});

const database = new Database(config, logger, () => {
  const logs = new Logs(config, database, logger);
  new Main(config, database, logs);
});
