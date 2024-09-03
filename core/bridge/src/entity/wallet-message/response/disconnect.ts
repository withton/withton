import type { ErrorResponse } from "./response-kit";

export type DisconnectResponse =
  | DisconnectSuccessResponse
  | DisconnectErrorResponse;

export interface DisconnectSuccessResponse {
  status: "success";
  requestId: string;
  result: Record<string, never>;
}

export interface DisconnectErrorResponse extends ErrorResponse {
  status: "error";
  error: {
    code: DISCONNECT_ERROR_CODE;
    message: string;
    details?: unknown;
  };
  requestId: string;
}

export enum DISCONNECT_ERROR_CODE {
  UNKNOWN_ERROR = 0,
  BAD_REQUEST_ERROR = 1,
  UNKNOWN_APP_ERROR = 100,
  METHOD_NOT_SUPPORTED = 400,
}
