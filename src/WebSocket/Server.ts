import { Logger } from 'winston';
import * as WebSocket from 'ws';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';

import Base from '../Base';
import EventPayload from '../Types/EventPayload';
import Config from '../Types/Config';

export default class Server extends Base {
  public onEvent: (event: EventPayload) => void;

  constructor(
    logger: Logger,
    config: Config,
    onEvent: (event: EventPayload) => void
  ) {
    super(logger, config);
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

    wss.on('connection', (ws: WebSocket, req: http.IncomingMessage) => {
      this.logger.debug(`New connection: ${req.connection.remoteAddress}`);
      ws.on(
        'message',
        async (message: string): Promise<void> => {
          this.logger.debug(`Server Message: ${message}`);
          let data: EventPayload | null = null;
          try {
            data = JSON.parse(message);
          } catch (e) {
            this.logger.warn(e);
          }
          if (!data || !data.token)
            ws.send(JSON.stringify({ error: 'Invalid payload' }));
          else if (data.token !== this.config.token)
            ws.send(JSON.stringify({ error: 'Incorrect token' }));
          else {
            delete data.token;
            const result = await this.onEvent(data);
            this.logger.debug(`onEvent result: ${JSON.stringify(result)}`);
            ws.send(
              JSON.stringify(data.resultOnly ? result : { ...data, result })
            );
          }
        }
      );
    });

    server.listen(this.config.core.socket_port);
    this.logger.info(`Socket starting on port ${this.config.core.socket_port}`);
  }
}
