import { createLogger, format, transports } from 'winston';
import * as fs from 'fs';
import * as YAML from 'yaml';

import Config from './Types/Config';
import Main from './Main';

const config: Config = YAML.parse(
  fs.readFileSync('./upaas_config.yaml', 'utf8')
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

new Main(logger, config);
