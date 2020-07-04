import { Logger } from 'winston';
import * as WebSocket from 'ws';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

import { EventPayload } from '../Events/Events';
import Base from '../Base';
import config from '../config';

export default class Server extends Base {
  public onEvent: (event: EventPayload) => void;

  constructor(logger: Logger, onEvent: (event: EventPayload) => void) {
    super(logger);
    this.onEvent = onEvent;
  }

  init() {
    let server: https.Server | http.Server;
    const isSsl = fs.existsSync(process.env.SSL_PATH_CERT || 'fullchain.pem');
    if (isSsl) {
      server = https.createServer({
        cert: fs
          .readFileSync(process.env.SSL_PATH_CERT || 'fullchain.pem')
          .toString(),
        key: fs
          .readFileSync(process.env.SSL_PATH_KEY || 'privkey.pem')
          .toString(),
      });
    } else {
      server = http.createServer();
    }

    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws: WebSocket) => {
      ws.on('message', (message: string) => {
        this.logger.info('Server Message: ');
        this.logger.info(message);
        this.onEvent(JSON.parse(message));
      });
    });

    server.listen(config.port);
  }
}
