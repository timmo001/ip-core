export interface ConfigBackend {
  api_port: number;
  secret: string;
  token_expiry: string;
}

export default interface Config {
  log_level: string;
  services_directory: string;
  socket_port: number;
  backend: ConfigBackend;
}
