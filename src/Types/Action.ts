import GenericObject from './GenericObject';
import ServiceDefinition from './ServiceDefinition';

export default interface Action {
  description?: string;
  requires?: string;
  service: ServiceDefinition;
  parameters: GenericObject;
}
