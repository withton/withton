import type { ErrorResponse, SuccessResponse } from './response-kit';

export type SendTransactionResponse =
  | SendTransactionSuccessResponse
  | SendTransactionErrorResponse;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SendTransactionSuccessResponse extends SuccessResponse {}

export interface SendTransactionErrorResponse extends ErrorResponse {

  error: {
    code: SEND_TRANSACTION_ERROR_CODE;
    message: string;
    details?: unknown;
  };
}

export enum SEND_TRANSACTION_ERROR_CODE {
  UNKNOWN_ERROR = 0,
  BAD_REQUEST_ERROR = 1,
  UNKNOWN_APP_ERROR = 100,
  USER_REJECTED = 300,
  METHOD_NOT_SUPPORTED = 400,
}
