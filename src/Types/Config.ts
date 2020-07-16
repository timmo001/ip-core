export interface ConfigBackend {
  api_port: number;
  secret: string;
  token_expiry: string;
}

export interface ConfigCore {
  host: string;
  log_level: string;
  socket_port: number;
}

export interface ConfigDatabase {
  database: string;
  host: string;
  password: string;
  port: number;
  username: string;
}

export default interface Config {
  backend: ConfigBackend;
  core: ConfigCore;
  database: ConfigDatabase;
  services_directory: string;
  token: string;
}
