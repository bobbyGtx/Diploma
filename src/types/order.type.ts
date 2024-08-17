import {OrderTypes} from "./order-types.type";

export type OrderType={
  name:string,
  phone:string,
  service?:string,
  type:OrderTypes,
}
