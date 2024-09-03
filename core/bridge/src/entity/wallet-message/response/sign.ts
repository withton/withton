import type { ErrorResponse } from "./response-kit";

export type SignDataResponse = SignDataSuccessResponse | SignDataErrorResponse;

export interface SignDataSuccessResponse {
  requestId: string;
  result: {
    signature: string;
    timestamp: string;
  };
}

export interface SignDataErrorResponse extends ErrorResponse {
  error: {
    code: SIGN_DATA_ERROR_CODE;
    message: string;
    details?: unknown;
  };
  requestId: string;
}

export enum SIGN_DATA_ERROR_CODE {
  UNKNOWN_ERROR = 0,
  BAD_REQUEST_ERROR = 1,
  UNKNOWN_APP_ERROR = 100,
  USER_REJECTED = 300,
  METHOD_NOT_SUPPORTED = 400,
}
