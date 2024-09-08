import {
  App,
  ConnectionError,
  ConnectionRequest,
  RPC,
  WalletEvent,
  WalletResponse,
} from "@withton/bridge";

import { RemoveId, DistributiveRemoveId } from "../helpers/types";

export type Controller = InternalController | HTTPController;

export interface InternalController extends BaseController {
  type: "injected";
  connect(message: ConnectionRequest): void;
}

export interface HTTPController extends BaseController {
  type: "http";
  connect(
    message: ConnectionRequest,
    options?: {
      openingDeadline?: number;
      signal?: AbortSignal;
    },
  ): string;
  unPause(options?: {});
}

interface BaseController {
  restoreConnection(options?: {
    openingDeadline?: number;
    signal?: AbortSignal;
  }): Promise<void>;

  closeConnection(): void;

  disconnect(options?: { singal?: AbortSignal }): Promise<void>;

  sendRequest<T extends RPC>(
    request: RemoveId<App<T>>,
    options?: {
      onRequestSent?: () => void;
      signal?: AbortSignal;
      attempts?: number;
    },
  ): Promise<RemoveId<WalletResponse<T>>>;
}
