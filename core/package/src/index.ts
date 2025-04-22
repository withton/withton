import { IWithTon } from './withton.interface';
import { WalletsListController } from './controller';
import { WithTonConnectionError } from './errors';
import { WithTonMonitor } from './monitor';
import { ConnectionManager } from './storage/connect';
import { HttpBridgeStorage } from './storage/http';
import { LocalStorageWrapper } from './storage';
import { 
  WalletDetails, 
  ConnectionSource, 
  HTTPConnectionSource,
  WalletDetailsUnion,
  JSConnectionSource,
} from './blueprints';
import { TransactionRequest, TransactionResponse } from './blueprints/methods';
import { ConnectRequest } from './blueprints/methods/connect/request';
import { CHAIN } from '@withton/bridge';

export { 
  WalletsListController, 
  WithTonConnectionError,
  WithTonMonitor,
  ConnectionManager,
  HttpBridgeStorage,
  LocalStorageWrapper
};
export type { IWithTon };
export * from './blueprints';
export * from './connect';
export * from './errors';
export * from './helpers';
export * from './monitor';
export * from './storage';

export interface TransactionOptions {
  to: string;
  value: string;
  comment?: string;
}

export interface Wallet {
  name: string;
  appName: string;
  iconUrl: string;
  aboutUrl: string;
  platforms: string[];
  account?: {
    address: string;
    chain: string;
  };
}

export interface Transaction {
  hash: string;
  status: 'pending' | 'completed' | 'failed';
}

interface TonAccount {
  address: string;
  chain: string;
  balance: string;
  network: CHAIN;
  stateInit: string;
  publicKey: string;
}

interface BridgeInterface {
  hasSession(): boolean;
  getWallets(): Promise<WalletDetailsUnion[]>;
  onStatusChange(callback: (status: { error?: { message: string }; wallet: WalletDetails | null }) => void): () => void;
  connect(wallet: ConnectionSource | Pick<HTTPConnectionSource, 'bridgeLink'>[], request?: ConnectRequest): string | void;
  restore(options?: { openingDeadline?: number; signal?: AbortSignal }): Promise<{ wallet: WalletDetails; account: TonAccount } | null>;
  pause(): void;
  unpause(): Promise<void>;
  disconnect(options?: { signal?: AbortSignal }): Promise<void>;
  sendTransaction(transaction: TransactionRequest, options?: { onRequest?: () => void; signal?: AbortSignal }): Promise<TransactionResponse>;
}

export class WithTon implements IWithTon {
  private bridge: BridgeInterface;
  private _wallet: WalletDetails | undefined;
  private _account: TonAccount | null = null;
  private _isConnected = false;
  private isPausedState = false;

  constructor() {
    this.bridge = {
      hasSession: () => false,
      getWallets: async () => [],
      onStatusChange: () => () => {},
      connect: () => {},
      restore: async () => null,
      pause: () => {},
      unpause: async () => {},
      disconnect: async () => {},
      sendTransaction: async () => ({ 
        hash: '', 
        status: 'pending',
        signedTransaction: ''
      })
    };
  }

  get wallet(): WalletDetails | undefined {
    return this._wallet;
  }

  get account(): TonAccount | null {
    return this._account;
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  isPaused(): boolean {
    return this.isPausedState;
  }

  hasSession(): boolean {
    return this.bridge.hasSession();
  }

  validateBalance(minBalance: number): boolean {
    if (!this._account) return false;
    return BigInt(this._account.balance) >= BigInt(minBalance);
  }

  async wallets(): Promise<WalletDetailsUnion[]> {
    return this.bridge.getWallets();
  }

  status(
    cb: (wallet: WalletDetails | null) => void,
    error?: (error: WithTonConnectionError) => void
  ): () => void {
    return this.bridge.onStatusChange((status: { error?: { message: string }; wallet: WalletDetails | null }) => {
      if (status.error) {
        error?.(new WithTonConnectionError(status.error.message));
      } else {
        cb(status.wallet);
      }
    });
  }

  join<T extends ConnectionSource | Pick<HTTPConnectionSource, 'bridgeLink'>[]>(
    wallet?: T,
    request?: ConnectRequest
  ): T extends JSConnectionSource ? void : string {
    if (!wallet) {
      throw new WithTonConnectionError('No wallet provided');
    }

    const result = this.bridge.connect(wallet, request);
    if (Array.isArray(wallet) || 'bridgeLink' in wallet) {
      return result as T extends JSConnectionSource ? void : string;
    }
    return result as T extends JSConnectionSource ? void : string;
  }

  async restore(options?: { openingDeadline?: number; signal?: AbortSignal }): Promise<void> {
    try {
      const session = await this.bridge.restore(options);
      if (session) {
        this._wallet = session.wallet;
        this._account = session.account;
        this._isConnected = true;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new WithTonConnectionError(error.message);
      }
      throw new WithTonConnectionError('Failed to restore session');
    }
  }

  pause(): void {
    this.isPausedState = true;
    this.bridge.pause();
  }

  async unpause(): Promise<void> {
    this.isPausedState = false;
    await this.bridge.unpause();
  }

  async disconnect(options?: { signal?: AbortSignal }): Promise<void> {
    try {
      await this.bridge.disconnect(options);
      this._wallet = undefined;
      this._account = null;
      this._isConnected = false;
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new WithTonConnectionError(error.message);
      }
      throw new WithTonConnectionError('Failed to disconnect');
    }
  }

  async sendTransaction(
    transaction: TransactionRequest,
    options?: { onRequest?: () => void; signal?: AbortSignal }
  ): Promise<TransactionResponse>;
  async sendTransaction(
    transaction: TransactionRequest,
    onRequest?: () => void
  ): Promise<TransactionResponse>;

  async sendTransaction(
    transaction: TransactionRequest,
    optionsOrOnRequest?: { onRequest?: () => void; signal?: AbortSignal } | (() => void)
  ): Promise<TransactionResponse> {
    if (!this._isConnected) {
      throw new WithTonConnectionError('No wallet connected');
    }

    try {
      const options = typeof optionsOrOnRequest === 'function' 
        ? { onRequest: optionsOrOnRequest }
        : optionsOrOnRequest;

      return await this.bridge.sendTransaction(transaction, options);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new WithTonConnectionError(error.message);
      }
      throw new WithTonConnectionError('Failed to send transaction');
    }
  }
}

