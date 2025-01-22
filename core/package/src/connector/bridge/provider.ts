
import { WithTonConnectionError } from "../../errors";
import {
  HTTPConnectionSource,
} from "../../blueprints/wallet/connect";

import {
  App,
  Base64,
  ConnectionRequest,
  ConnectionSuccess,
  hexToBytes,
  mergeByteArrays,
  RPC,
  SessionCrypto,
  TonAddressItem,
  WalletEvent,
  WalletResponse,
} from "@withton/bridge";

import { ConnectorGeteway } from "../../connector/bridge/gateway";
import {
  HttpConnection,
  isPendingHttpConnection,
} from "../../connector/bridge/core/connection";

import { BridgeIMessage } from "./core/IMessage";
import { BridgeSession, BridgeSessionType } from "./core/session";
import { ConnectionManager } from "../../storage/connect";
import { StorageType } from "../../storage/models/types";
import {
  MakeOptional,
  RemoveId,
  DistributiveRemoveId,
} from "../../helpers/types";
import { BRIDGE_VERSION } from "../../config/bridge";

import { loggerDebug } from "../../helpers/logger";
import {
  isTelegramLink,
  encodeTelegramParams,
} from "../../helpers/tg-url-formater";
import { onSuccess } from "../../helpers/onSuccess";
import { createAbortManager } from "../../helpers/abortManager";

export class ConnectorProvider implements HttpConnection {
  public static async fromStorage(storage: StorageType): Promise<ConnectorProvider> {
    // @ts-ignore
    const connectorBridgeStorage = new ConnectionManager(storage);
    const connection = await connectorBridgeStorage.getHttpConnection();

    if (isPendingHttpConnection(connection)) {
      // @ts-ignore
      return new ConnectorProvider(storage, connection.connectionSource);
    }
    return new ConnectorProvider(storage, { bridgeLink: connection.session.bridgeLink });
  }

  public readonly type = "http";

  private readonly standardUniversalLink = "wt://";

  private readonly connectionStorage: ConnectionManager;
  // @ts-ignore
  private readonly pendingRequests = new Map<string, (response: RemoveId<WalletResponse<RPC>>) => void>();
  // @ts-ignore
  private session: BridgeSession | BridgeSessionType | null = null;

  private gateway: ConnectorGeteway | null = null;

  private pendingGateways: ConnectorGeteway[] = [];
  // @ts-ignore
  private listeners: Array<(e: DistributiveRemoveId<WalletEvent>) => void> = [];

  private readonly defaultOpeningDeadline = 12000;

  // private readonly defaultRetryTimeout = 2000;

  private abortController?: AbortController;

  constructor(
    private readonly storage: StorageType,
    private readonly walletConnectionSource: | MakeOptional<HTTPConnectionSource, 'universalLink'> | Pick<HTTPConnectionSource, 'bridgeLink'>
  ) {// @ts-ignore
    this.connectionStorage = new ConnectionManager(storage);
  }

  public connect(
    message?: ConnectionRequest,
    options?: { openingDeadline?: number; signal?: AbortSignal }
  ): string {
    const abortController = createAbortManager(options?.signal);
    this.abortController?.abort();
    this.abortController = abortController;

    this.closeGateways();

    const sessionCrypto = new SessionCrypto();

    this.session = {
      sessionCrypto,
      bridgeLink: 'bridgeLink' in this.walletConnectionSource ? this.walletConnectionSource?.bridgeLink : ''
    };

    this.connectionStorage.storeConnection({
      type: 'http',
      connectionSource: this.walletConnectionSource,
      sessionCrypto
    }).then(async () => {
      if (abortController.signal.aborted) {
        return;
      }

      await onSuccess(
        (_options) => this.openGateways(sessionCrypto, {
          openingDeadlineMS: options?.openingDeadline ?? this.defaultOpeningDeadline,
          signal: _options?.signal,
        }),
        {
          attempts: Number.MAX_SAFE_INTEGER,
          signal: abortController.signal,
        }
      );
    });

    const universalLink = 'universalLink' in this.walletConnectionSource && this.walletConnectionSource.universalLink
      ? this.walletConnectionSource.universalLink
      : this.standardUniversalLink;
    // @ts-ignore
    return this.generateUniversalLink(universalLink, message);
  }

  public async restore(options?: { openingDeadline?: number; signal?: AbortSignal }): Promise<void> {
    const abortController = createAbortManager(options?.signal);
    this.abortController?.abort();
    this.abortController = abortController;

    if (abortController.signal.aborted) {
      return;
    }

    this.closeGateways();

    const storedConnection = await this.connectionStorage.getHttpConnection();
    if (!storedConnection) {
      return;
    }

    const openingDeadline = options?.openingDeadline ?? this.defaultOpeningDeadline;

    if (isPendingHttpConnection(storedConnection)) {
      this.session = {
        sessionCrypto: storedConnection.sessionCrypto,
        bridgeLink: 'bridgeLink' in this.walletConnectionSource ? this.walletConnectionSource.bridgeLink : ''
      };

      return await this.openGateways(storedConnection.sessionCrypto, {
        openingDeadlineMS: openingDeadline,
        signal: abortController.signal,
      });
    }

    if (Array.isArray(this.walletConnectionSource)) {
      throw new WithTonConnectionError('Internal error. Connection source is array while WalletConnectionSourceHTTP was expected.');
    }

    this.session = storedConnection.session;

    if (this.gateway) {
      loggerDebug('Gateway is already opened, closing previous gateway');
      await this.gateway.close();
    }

    this.gateway = new ConnectorGeteway(
      this.storage,
      this.walletConnectionSource.bridgeLink,
      storedConnection.session.sessionCrypto.sessionId,
      this.gatewayListener.bind(this),
      this.gatewayErrorsListener.bind(this)
    );
    // @ts-ignore
    this.listeners.forEach((callbackfn) => callbackfn(storedConnection.connectionEvent));

    try {
      await onSuccess(
        async (options) => this.gateway?.registerSession({
          openingDeadline: openingDeadline,
          signal: options?.signal,
        }),
        {
          attempts: Number.MAX_SAFE_INTEGER,
          signal: abortController.signal,
        }
      );
    } catch (e) {
      await this.disconnect({ signal: abortController.signal });
      return;
    }
  }

  public sendRequest<T extends RPC>(
    // @ts-ignore
    request: RemoveId<App<T>>,
    options: {
      attempts?: number;
      onRequest?: () => void;
      signal?: AbortSignal;
    }
    // @ts-ignore
  ): Promise<RemoveId<WalletResponse<T>>> {
    return new Promise(async (resolve, reject) => {
      if (!this.gateway || !this.session || !('publicKey' in this.session)) {
        throw new WithTonConnectionError('Trying to send bridge request without session');
      }

      const id = (await this.connectionStorage.getNextRequestId()).toString();
      await this.connectionStorage.increaseNextRequestId();

      loggerDebug('Send http-bridge request:', { ...request, id });
      const encodedRequest = this.session!.sessionCrypto.encrypt(
        JSON.stringify({ ...request, id }),
        // @ts-ignore
        mergeByteArrays(this.session.publicKey)
      );
      try {
        // @ts-ignore
        await this.gateway?.send(encodedRequest, this.session.publicKey, request.method, {
          attempts: options.attempts,
          signal: options.signal,
        });
        options.onRequest?.();
        this.pendingRequests.set(id.toString(), resolve);
      } catch (e) {
        reject(e);
      }
    });
  }

  public closeConnection(): void {
    this.gateway?.close();
    this.listeners = [];
    this.session = null;
    this.gateway = null;
  }

  public async disconnect(options?: { signal?: AbortSignal }): Promise<void> {
    return new Promise(async (resolve) => {
      let called = false;
      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      const RequestSent = (): void => {
        if (!called) {
          called = true;
          this.removeBridgeAndSession().then(resolve);
        }
      };

      try {
        this.closeGateways();

        const abortController = createAbortManager(options?.signal);
        timeoutId = setTimeout(() => {
          abortController.abort();
        }, this.defaultOpeningDeadline);

        await this.sendRequest(
          // @ts-ignore
          { method: 'disconnect', params: [] },
          {
            onRequest: RequestSent,
            signal: abortController.signal,
            attempts: 1,
          }
        );
      } catch (e) {
        loggerDebug('Disconnect error:', e);

        if (!called) {
          this.removeBridgeAndSession().then(resolve);
        }
      } finally {
        if (timeoutId) {
          clearInterval(timeoutId);
        }
        RequestSent();
      }
    });
  }
  // @ts-ignore
  public listen(callback: (e: DistributiveRemoveId<WalletEvent>) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((predicate) => predicate !== callback);
    };
  }

  public pause(): void {
    this.gateway?.pause();
    this.pendingGateways.forEach((b) => b.pause());
  }

  public async unPause(): Promise<void> {
    const promises = this.pendingGateways.map((b) => b.unPause());
    if (this.gateway) {
      promises.push(this.gateway.unPause());
    }
    await Promise.all(promises);
  }

  private async pendingGatewaysListener(
    gateway: ConnectorGeteway,
    bridgeLink: string,
    BridgeIMessage: BridgeIMessage
  ): Promise<void> {
    if (!this.pendingGateways.includes(gateway)) {
      await gateway.close();
      return;
    }
    // @ts-ignore
    this.closeGateways({ except: gateway });

    if (this.gateway) {
      loggerDebug('Gateway is already opened, closing previous gateway');
      await this.gateway.close();
    }

    this.session!.bridgeLink = bridgeLink;
    this.gateway = gateway;
    this.gateway.setErrorsListener(this.gatewayErrorsListener.bind(this));
    this.gateway.setListener(this.gatewayListener.bind(this));
    return this.gatewayListener(BridgeIMessage);
  }

  private async gatewayListener(bridgeIMessage: BridgeIMessage): Promise<void> {
    const walletMessage: WalletEvent = JSON.parse(
      await this.session!.sessionCrypto.decrypt(
        Base64.decode(bridgeIMessage.message).toUint8Array(),
        // @ts-ignore
        hexToBytes(bridgeIMessage.from)
      )
    );
    loggerDebug('wallet received:', walletMessage);

    if (!('event' in walletMessage)) {
      const id = walletMessage.eventId.toString();
      const resolve = this.pendingRequests.get(id);
      if (!resolve) {
        loggerDebug(`Response id ${id} doesn't match any request's id`);
        return;
      }
      // @ts-ignore
      resolve(walletMessage);
      this.pendingRequests.delete(id);
      return;
    }

    if (walletMessage !== undefined) {
      const lastId = await this.connectionStorage.getLastEventId();

      if (lastId !== undefined && walletMessage.eventId <= lastId) {
        loggerDebug(`Received event id (=${walletMessage.eventId}) must be greater than stored last wallet event id (=${lastId})`);
        return;
      }
      if (walletMessage.eventType !== 'connection_success') {
        await this.connectionStorage.storeLastEventId(walletMessage.eventId);
      }
    }

    const listeners = this.listeners;

    if (walletMessage.eventType === 'connection_success') {
      await this.updateSession(walletMessage, bridgeIMessage.from);
    }

    if (walletMessage.eventType === 'disconnect') {
      loggerDebug('Removing bridge and session: received disconnect event'),
        await this.removeBridgeAndSession();
    }
    listeners.forEach((listener) => listener(walletMessage));
  }

  private async gatewayErrorsListener(event: Event): Promise<void> {
    throw new WithTonConnectionError(`Bridge error ${JSON.stringify(event)}`);
  }

  private async updateSession(connectEvent: ConnectionSuccess, publicKey: string): Promise<void> {
    this.session = {
      ...this.session!,
      publicKey,
    };

    const tonAddressItem: TonAddressItem = connectEvent.data.responses.find(
      (item) => item.type === 'ton_address'
    ) as unknown as TonAddressItem;
    // @ts-ignore
    const connectEventToSave: HttpConnection['connectionEvent'] = {
      ...connectEvent,
      details: {
        ...connectEvent.data,
        addresses: [tonAddressItem],
      },
    };
    await this.connectionStorage.storeConnection({
      type: 'http',
      session: this.session,
      lastEventId: connectEvent.eventId,
      connectionEvent: connectEventToSave,
      nextRequestId: 0,
    });
  }

  private async removeBridgeAndSession(): Promise<void> {
    this.closeConnection();
    await this.connectionStorage.removeConnection();
  }

  private generateUniversalLink(universalLink: string, message: ConnectionRequest): string {
    if (!isTelegramLink(universalLink)) {
      return this.generateTGUniversalLink(universalLink, message);
    }
    return this.generateRegularUniversalLink(universalLink, message);
  }

  private generateRegularUniversalLink(universalLink: string, message: ConnectionRequest): string {
    const url = new URL(universalLink);
    url.searchParams.append('v', BRIDGE_VERSION.toString());
    url.searchParams.append('id', this.session!.sessionCrypto.sessionId);
    url.searchParams.append('r', JSON.stringify(message));
    return url.toString();
  }

  private generateTGUniversalLink(universalLink: string, message: ConnectionRequest): string {
    const urlToWrap = this.generateRegularUniversalLink('about:blank', message);
    const linkParams = urlToWrap.split('?')[1]!;

    const startapp = 'tonconnect-' + encodeTelegramParams(linkParams);
    const updatedUniversalLink = this.convertToDirectLink(universalLink);

    const url = new URL(updatedUniversalLink);
    url.searchParams.append('startapp', startapp);
    return url.toString();
  }

  private convertToDirectLink(universalLink: string): string {
    const url = new URL(universalLink);

    if (url.searchParams.has('attach')) {
      url.searchParams.delete('attach');
      url.pathname += '/start';
    }

    return url.toString();
  }

  private async openGateways(
    sessionCrypto: SessionCrypto,
    options?: {
      openingDeadlineMS?: number;
      signal?: AbortSignal;
    }
  ): Promise<void> {
    if (Array.isArray(this.walletConnectionSource)) {
      // close all gateways before opening new ones
      this.pendingGateways.map((bridge) => bridge.close().catch());

      // open new gateways
      this.pendingGateways = this.walletConnectionSource.map((source) => {
        const gateway = new ConnectorGeteway(
          this.storage,
          source.bridgeLink,
          sessionCrypto.sessionId,
          () => { },
          () => { }
        );

        gateway.setListener((message) =>
          this.pendingGatewaysListener(gateway, source.bridgeLink, message)
        );

        return gateway;
      });

      await Promise.allSettled(
        this.pendingGateways.map((bridge) =>
          onSuccess(
            (_options): Promise<void> => {
              if (!this.pendingGateways.some(item => item === bridge)) {
                return bridge.close();
              }
              return bridge.registerSession({
                openingDeadline: options?.openingDeadlineMS ?? this.defaultOpeningDeadline,
                signal: _options.signal,
              });
            },
            {
              attempts: Number.MAX_SAFE_INTEGER,
              signal: options?.signal,
            }
          )
        )
      );

      return;
    } else {
      if (this.gateway) {
        loggerDebug(`Gateway is already opened, closing previous gateway`);
        await this.gateway.close();
      }

      this.gateway = new ConnectorGeteway(
        this.storage,
        this.walletConnectionSource.bridgeLink,
        sessionCrypto.sessionId,
        this.gatewayListener.bind(this),
        this.gatewayErrorsListener.bind(this)
      );
      return await this.gateway.registerSession({
        openingDeadline: options?.openingDeadlineMS,
        signal: options?.signal,
      });
    }
  }

  private closeGateways(options?: { expect?: ConnectorGeteway }): void {
    this.gateway?.close();
    this.pendingGateways.filter((predicate) => predicate !== options?.expect).forEach((item) => item.close());
    this.pendingGateways = [];
  }
}
