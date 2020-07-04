import GenericObject from './GenericObject';

// { "type": "service", "serviceKey": "1234", "data": {} }
export default interface EventPayload {
  type: 'service';
  serviceKey?: string;
  data?: GenericObject;
}
