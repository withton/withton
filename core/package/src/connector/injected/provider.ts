import { InjectedError, WithTonConnectionError } from "../../errors";
import {
  App,
  ConnectionError,
  ConnectionRequest,
  RPC,
  WalletEvent,
  WalletResponse,
} from "@withton/bridge";
import { API, isBridgeWithMetaData } from "./core/api";
import { InternalController } from '../index';
import { ConnectionManager } from '../../storage/connect';
import { StorageType } from '../../storage/models/types';
import { MemoryStorage } from '../../storage/models/memory';
import { RemoveId, DistributiveRemoveId } from '../../helpers/types';
import { getGlobalWindow, getGlobalWindowKeys } from '../../helpers/api';
import { tonConfigVersion } from '../../config/version';
import { CurrentInjectedWalletDetails } from '../../blueprints';
import { loggerDebug } from '../../helpers/logger';

type WindowWithTon<T extends string> = {
  [key in T]: { withton: API }
} & Window;

export class InjectedConnector<T extends string = string> implements InternalController {
  private static window = getGlobalWindow();

  public static async fromStorage(storage: StorageType): Promise<InjectedConnector> {
    const connectionManager = new ConnectionManager(MemoryStorage.getInstance());
    const bridgeConnection = await connectionManager.getConnection();
    // @ts-ignore
    return new InjectedConnector(storage, bridgeConnection);
  }

  public static isWalletInjected(injectedWalletKey: string): boolean {
    return this.isWindowContainsWallet(this.window, injectedWalletKey);
  }

  public static isInsideWalletBrowser(injectedWalletKey: string): boolean {
    if (this.isWindowContainsWallet(this.window, injectedWalletKey)) {
      return this.window[injectedWalletKey]!.withton.isBrowser;
    }
    return false;
  }

  public static getCurrentInjectedWallets(): CurrentInjectedWalletDetails[] {
    if (!this.window) {
      return [];
    }
    const windowKeys = getGlobalWindowKeys();
    const wallets = windowKeys.filter(([_, value]) => isBridgeWithMetaData(value)) as unknown as [string, { withton: API }][];

    return wallets?.map(([jsKeys, wallet]) => ({
      name: wallet?.withton?.wallet.name,
      appName: wallet.withton.wallet.appName,
      aboutUrl: wallet.withton.wallet.aboutUrl,
      iconUrl: wallet.withton.wallet.iconUrl,
      tonDns: wallet.withton.wallet.tonDns,
      jsBridgeKey: jsKeys,
      injected: true,
      embedded: wallet.withton.isBrowser,
      platforms: wallet.withton.wallet.platforms,
    }));
  }

  private static isWindowContainsWallet<T extends string>(
    window: Window | undefined,
    injectedWalletKey: string
  ): window is WindowWithTon<T> {
    return (
      !!window &&
      injectedWalletKey in window &&
      typeof window[injectedWalletKey as keyof Window] === 'object' &&
      'withton' in window[injectedWalletKey as keyof Window]
    );
  }

  public readonly type = 'injected';
  private unsubscribeCallback: (() => void) | null = null;
  private injectedWallet: API;
  private readonly connectionStorage: ConnectionManager;
  private listenSubscriptions = false;
  // @ts-ignore
  private listeners: Array<(e: DistributiveRemoveId<WalletEvent>) => void> = [];

  constructor(storage: StorageType, private readonly injectedWalletKey: T) {
    const window: Window | undefined | WindowWithTon<T> = InjectedConnector.window;

    if (!InjectedConnector.isWindowContainsWallet(window, injectedWalletKey)) {
      throw new InjectedError('Injected Wallet Error');
    }
    // @ts-ignore
    this.connectionStorage = new ConnectionManager(storage);
    this.injectedWallet = window[injectedWalletKey]!.withton;
  }

  public connect(message: ConnectionRequest): void {
    this._connect(Number(tonConfigVersion), message);
  }

  public async restoreConnection(): Promise<void> {
    try {
      loggerDebug('Restoring connection...');
      const connectEvent = await this.injectedWallet.restore();
      loggerDebug('Restoring connection response', connectEvent);

      if (connectEvent.eventType === 'connection_success') {
        this.makeSubscriptions();
        this.listeners.forEach(callback => callback(connectEvent));
      } else {
        await this.connectionStorage.removeConnection();
      }
    } catch (e: any) {
      await this.connectionStorage.removeConnection();
      throw new WithTonConnectionError(e?.message);
    }
  }

  public closeConnection(): void {
    if (this.listenSubscriptions) {
      this.injectedWallet.disconnect();
    }
    this.closeAllListeners();
  }

  public async disconnect(): Promise<void> {
    return new Promise(resolve => {
      const onRequest = (): void => {
        this.closeAllListeners();
        this.connectionStorage.removeConnection().then(resolve);
      };
      try {
        this.injectedWallet.disconnect();
        onRequest();
      } catch (e) {
        loggerDebug(e);
        this.sendRequest(
          {
            method: 'disconnect',
            // @ts-ignore
            params: [],
          },
          onRequest
        );
      }
    });
  }

  private closeAllListeners(): void {
    this.listenSubscriptions = false;
    this.listeners = [];
    this.unsubscribeCallback?.();
  }

  public async sendRequest<T extends RPC>(
    // @ts-ignore
    request: RemoveId<App<T>>,
    options?: { onRequestSent?: () => void; signal?: AbortSignal; attempts?: number }
    // @ts-ignore
  ): Promise<RemoveId<WalletResponse<T>>> {
    const id = (await this.connectionStorage.getNextRequestId()).toString();
    await this.connectionStorage.increaseNextRequestId();

    loggerDebug('Send injected-bridge request:', { ...request, id });
    const result = this.injectedWallet.send<T>({ ...request, id } as App<T>);
    result.then(response => loggerDebug('Wallet message received:', response));
    options?.onRequestSent?.();

    return result;
  }

  private async _connect(bridge_version: number, message: ConnectionRequest): Promise<void> {
    try {
      loggerDebug(`Injected Provider connect request: version: ${bridge_version}, message:`, message);
      const connectEvent = await this.injectedWallet.connect(bridge_version, message);
      loggerDebug('Injected Provider connect response:', connectEvent);

      if (connectEvent.eventType === 'connection_success') {
        await this.updateSession();
        this.makeSubscriptions();
      }
      this.listeners.forEach(callback => callback(connectEvent));
    } catch (e) {
      loggerDebug('Injected Provider connect error:', e);
      // @ts-ignore
      const connectEventError: RemoveId<ConnectionError> = {
        eventType: 'connection_error',
        data: {
          errorCode: 0,
          // @ts-ignore
          errorMessage: e?.toString(),
        },
      };
      this.listeners.forEach(callback => callback(connectEventError));
    }
  }

  private makeSubscriptions(): void {
    this.listenSubscriptions = true;
    this.unsubscribeCallback = this.injectedWallet.listen(cb => {
      loggerDebug('Wallet Response:', cb);
      if (this.listenSubscriptions) {
        this.listeners.forEach(callback => callback(cb));
      }
      if (cb.eventType === 'disconnect') {
        this.disconnect();
      }
    });
  }

  private updateSession(): Promise<void> {
    return this.connectionStorage.storeConnection({
      type: 'injected',
      jsBridgeKey: this.injectedWalletKey,
      nextRequestId: 0,
    });
  }
}
