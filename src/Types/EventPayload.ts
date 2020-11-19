import Data from './Data';

export default interface EventPayload {
  completed?: string;
  data: Data;
  id?: string;
  resultOnly?: boolean;
  service: string;
  serviceKey?: string;
  endpointKey?: string;
  started?: string;
  status?: string;
  token?: string;
  updated?: string;
}
