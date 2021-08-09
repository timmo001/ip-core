import Generic from "./Generic";
import GenericObject from "./GenericObject";

export default interface Variables {
  body?: Generic;
  config?: GenericObject;
  db?: GenericObject;
  headers?: GenericObject;
  parameters?: GenericObject;
  results?: GenericObject;
}
