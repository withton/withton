import {
  App,
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
  pause(): void;
  unPause(options?: {
    openingDeadline?: number;
    signal?: AbortSignal
  }): Promise<void>;
}

interface BaseController {
  restoreConnection(options?: {
    openingDeadline?: number;
    signal?: AbortSignal;
  }): Promise<void>;

  closeConnection(): void;

  disconnect(options?: { singal?: AbortSignal }): Promise<void>;

  sendRequest<T extends RPC>(
     // @ts-ignore
    request: RemoveId<App<T>>,
    options?: {
      onRequestSent?: () => void;
      signal?: AbortSignal;
      attempts?: number;
    },
    // @ts-ignore
  ): Promise<RemoveId<WalletResponse<T>>>;

  sendRequest<T extends RPC>(
     // @ts-ignore
    request: RemoveId<App<T>>,
    onRequestSend?: () => void
     // @ts-ignore
  ): Promise<RemoveId<WalletResponse<T>>>;
 // @ts-ignore
  listen(eventsCallback: (e: DistributiveRemoveId<WalletEvent>) => void): void;
}
