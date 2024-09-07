import {
  CONNECTION_ERROR_CODE,
  SEND_TRANSACTION_ERROR_CODE,
  SendTransactionRpcRequest,
  SendTransactionErrorResponse,
  App,
  SendTransactionSuccessResponse,
  SendTransactionResponse,
} from "@withton/bridge";
import { TransactionRequest } from "../blueprints/methods";
import {
  BadRequestError,
  WithTonConnectionError,
  PlaceholderError,
  RpcError,
  RejectsError,
} from "../errors";
import { RPCParser } from "./rpc";
import { RemoveId } from "../helpers/types";

const sendTransactionError: Partial<
  Record<CONNECTION_ERROR_CODE, typeof WithTonConnectionError>
> = {
  [SEND_TRANSACTION_ERROR_CODE.UNKNOWN_ERROR]: PlaceholderError,
  [SEND_TRANSACTION_ERROR_CODE.USER_REJECTED]: RejectsError,
  [SEND_TRANSACTION_ERROR_CODE.BAD_REQUEST_ERROR]: BadRequestError,
  [SEND_TRANSACTION_ERROR_CODE.UNKNOWN_APP_ERROR]: RpcError,
};

// @ts-ignore
class SendTransactionParser extends RPCParser<"sendTransaction"> {
  convertToRPC(
    request: Omit<TransactionRequest, "expiresAt"> & { expires_at: number },
  ): RemoveId<SendTransactionRpcRequest> {
    return {
      method: "sendTransaction",
      params: [JSON.stringify(request)],
    };
  }
  //
  parseAndThrowError(response: SendTransactionErrorResponse): never {
    const ErrorConstructor =
      sendTransactionError[response.error.code] || PlaceholderError;

    const errorMessage = `Error in request ${response.requestId}: ${response.error.message}`;

    throw new ErrorConstructor(errorMessage);
  }
  //
  public convertFromRPC(
    response: SendTransactionSuccessResponse,
  ): SendTransactionResponse {
    if (response.status !== "success") {
      throw new WithTonConnectionError(
        "Invalid response status: expected 'success'",
      );
    }

    return {
      result: response.result,
      status: "success",
      requestId: response.requestId,
    };
  }
}
export const sendTransactionParser = new SendTransactionParser();
