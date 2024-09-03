export type ResponseKit = SuccessResponse | ErrorResponse;

export interface SuccessResponse {
  status: "success";
  result: string;
  requestId: string;
}

export interface ErrorResponse {
  status: "error";
  error: {
    code: number;
    message: string;
    details?: unknown;
  };
  requestId: string;
}
