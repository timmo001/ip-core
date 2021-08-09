import GenericObject from "./GenericObject";

type Generic =
  | string
  | number
  | boolean
  | GenericObject
  | GenericObject[]
  | null;

export default Generic;
