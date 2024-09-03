import { App, RPCRequestMap } from "./request";
import { ConnectionRequest } from "./connect";

export type AppMessage = ConnectionRequest | App<keyof RPCRequestMap>;
