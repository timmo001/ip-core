import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.json(),
    format.simple(),
    format.splat()
  ),
  transports: [new transports.Console()],
});

export default logger;
