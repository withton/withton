import {
  MetaDataError,
  BadRequestError,
  RejectsError,
  NoMetaDataError,
  WithTonConnectionError,
  PlaceholderError,
} from "../errors";

import { CONNECTION_ERROR_CODE, ConnectionError } from "@withton/bridge";

// Map connection error codes to specific error classes
const connectEventErrorCode: Partial<
  Record<CONNECTION_ERROR_CODE, typeof WithTonConnectionError>
> = {
  [CONNECTION_ERROR_CODE.UNKNOWN_ERROR]: PlaceholderError,
  [CONNECTION_ERROR_CODE.USER_REJECTED]: RejectsError,
  [CONNECTION_ERROR_CODE.INVALID_REQUEST]: BadRequestError,
  [CONNECTION_ERROR_CODE.MANIFEST_NOT_FOUND]: NoMetaDataError,
  [CONNECTION_ERROR_CODE.MANIFEST_INVALID]: MetaDataError,
};
/**
 * Class responsible for parsing connection errors and returning appropriate error objects.
 */
class ConnectErrorsParser {
  /**
   * Parses the connection error data and returns a specific error instance.
   * If no matching error code is found, a default placeholder error is returned.
   *
   * @param error - The connection error data containing the error code and message.
   * @returns An instance of WithTonConnectionError (or subclass) based on the error code.
   */
  parseError(error: ConnectionError["data"]): WithTonConnectionError {
    let ErrorConstructor: typeof WithTonConnectionError = PlaceholderError;
    if (error.errorCode in connectEventErrorCode) {
      ErrorConstructor =
        connectEventErrorCode[error.errorCode] || PlaceholderError;
    }
    return new ErrorConstructor(error.errorMessage);
  }
}

export const connectErrorsParser = new ConnectErrorsParser();
