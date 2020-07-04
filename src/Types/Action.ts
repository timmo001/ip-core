import GenericObject from './GenericObject';
import ServiceDefinition from './ServiceDefinition';

export default interface Action {
  description?: string;
  service: ServiceDefinition;
  data: GenericObject;
}
