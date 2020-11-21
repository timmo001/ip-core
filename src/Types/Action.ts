import GenericObject from './GenericObject';
import ServiceDefinition from './ServiceDefinition';

export default interface Action {
  id: string;
  description?: string;
  requires?: string;
  service: ServiceDefinition;
  parameters: GenericObject;
}
