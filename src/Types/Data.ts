import Generic from "./Generic";
import GenericObject from "./GenericObject";

export default interface Data {
  body?: Generic;
  endpoint?: string;
  environment?: string;
  headers?: GenericObject;
  id?: string;
  method?: "DELETE" | "GET" | "POST" | "PATCH" | "PUT";
  parameters?: GenericObject;
  url?: string;
  version?: string;
}
