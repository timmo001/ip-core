import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as WebSocket from 'ws';

import Base from '../Base';
import Config from '../Types/Config';
import Database from '../Database';
import EventPayload from '../Types/EventPayload';
import Logs from '../Logs';

export default class Server extends Base {
  public onEvent: (event: EventPayload) => void;

  constructor(
    config: Config,
    database: Database,
    logs: Logs,
    onEvent: (event: EventPayload) => void
  ) {
    super(config, database, logs);
    this.onEvent = onEvent;
  }

  async init() {
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
      this.logs.debug(
        `New connection: ${req.connection.remoteAddress}`,
        'websocket'
      );
      ws.on(
        'message',
        async (message: string): Promise<void> => {
          this.logs.debug(`Server Message: ${message}`, 'websocket');
          let data: EventPayload | null = null;
          try {
            data = JSON.parse(message);
          } catch (e) {
            this.logs.warn(e, 'websocket');
          }
          if (!data || !data.token)
            ws.send(JSON.stringify({ error: 'Invalid payload' }));
          else if (data.token !== this.config.token)
            ws.send(JSON.stringify({ error: 'Incorrect token' }));
          else {
            delete data.token;
            const result = await this.onEvent(data);
            this.logs.debug(
              `onEvent result: ${JSON.stringify(result)}`,
              'websocket'
            );
            ws.send(JSON.stringify(data.resultOnly ? result : { result }));
          }
        }
      );
    });

    server.listen(this.config.core.socket_port);
    this.logs.info(
      `Socket starting on port ${this.config.core.socket_port}`,
      'websocket'
    );
  }
}
