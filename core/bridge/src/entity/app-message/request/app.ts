import { SendTransactionRpcRequest } from "./send";
import { SignDataRequest } from "./sign";
import { DisconnectRequest } from "./disconnect";
import { RPC } from "../../rpc";

export type RPCRequestMap = {
  sendTransaction: SendTransactionRpcRequest;
  signData: SignDataRequest;
  disconnect: DisconnectRequest;
};

export type App<T extends RPC> = RPCRequestMap[T];
