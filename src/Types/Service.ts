import Action from './Action';
import Condition from './Condition';

export default interface Service {
  name: string;
  description?: string;
  conditions: Condition[];
  actions: Action[];
}
