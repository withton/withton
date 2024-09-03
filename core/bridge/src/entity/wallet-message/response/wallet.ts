import type { RPC } from "../../rpc";
import {
  SendTransactionErrorResponse,
  SendTransactionSuccessResponse,
} from "./send";
import { SignDataErrorResponse, SignDataSuccessResponse } from "./sign";
import {
  DisconnectErrorResponse,
  DisconnectSuccessResponse,
} from "./disconnect";

export interface RPCResponseMap {
  sendTransaction: {
    success: SendTransactionSuccessResponse;
    error: SendTransactionErrorResponse;
  };
  signData: {
    success: SignDataSuccessResponse;
    error: SignDataErrorResponse;
  };
  disconnect: {
    success: DisconnectSuccessResponse;
    error: DisconnectErrorResponse;
  };
}

export type WalletResponseSuccess<T extends RPC> = RPCResponseMap[T]["success"];

export type WalletResponseError<T extends RPC> = RPCResponseMap[T]["error"];

export type WalletResponse<T extends RPC> =
  | WalletResponseSuccess<T>
  | WalletResponseError<T>;
