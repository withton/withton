import {
  App,
  RPC,
  WalletResponse,
  WalletResponseError,
  WalletResponseSuccess,
} from "@withton/bridge";
import { RemoveId } from "../helpers/types";

/**
 * Handles parsing operations for RPC responses, with support for responses
 * that may or may not include an `id`.
 * @template T - Type that extends RPC.
 */
export abstract class RPCParser<T extends RPC> {
  abstract convertToRPC(...args: unknown[]): RemoveId<App<any>>;

  /**
   * Converts a success response that includes an `id`.
   * @param response - The success response object with `id`.
   * @returns The parsed result.
   */
  abstract convertFromRPCWithId(
    response: WalletResponseSuccess<T> & { id: unknown },
  ): unknown;

  /**
   * Converts a success response that does not include an `id`.
   * @param response - The success response object without `id`.
   * @returns The parsed result.
   */
  abstract convertFromRPCWithoutId(response: WalletResponseSuccess<T>): unknown;

  /**
   * Throws an error based on the error response, handling responses
   * that do not include an `id`.
   * @param response - The error response object.
   * @throws The parsed error.
   */
  abstract parseAndThrowErrorWithoutId(response: WalletResponseError<T>): never;

  /**
   * Parses and throws an error for error responses that include an `id`.
   * @param response - The error response with `id`.
   * @throws The parsed error.
   */
  abstract parseAndThrowErrorWithId(
    response: WalletResponseError<T> & { id: unknown },
  ): never;

  /**
   * Determines if the response is an error response.
   * @param response - The wallet response.
   * @returns True if the response is an error, false otherwise.
   */
  public isError(
    response: WalletResponse<T>,
  ): response is WalletResponseError<T> {
    return "error" in response;
  }

  /**
   * Handles the conversion of a success response based on whether it includes an `id`.
   * @param response - The success response object.
   * @returns The parsed result.
   */
  public convertFromRPC(response: WalletResponseSuccess<T>): unknown {
    if ("id" in response) {
      return this.convertFromRPCWithId(
        response as WalletResponseSuccess<T> & { id: unknown },
      );
    } else {
      return this.convertFromRPCWithoutId(response);
    }
  }

  /**
   * Parses and throws an error based on whether the error response includes an `id`.
   * @param response - The error response object.
   * @throws The parsed error.
   */
  public parseAndThrowError(response: WalletResponseError<T>): never {
    if ("id" in response) {
      this.parseAndThrowErrorWithId(
        response as WalletResponseError<T> & { id: unknown },
      );
    } else {
      this.parseAndThrowErrorWithoutId(response);
    }
  }
}
