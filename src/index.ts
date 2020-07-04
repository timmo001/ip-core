import * as fs from 'fs';
import * as YAML from 'yaml';

import logger from './logger';
import Main from './Main';

const config = YAML.parse(fs.readFileSync('./upaas_config.yaml', 'utf8'));

new Main(logger, config);
