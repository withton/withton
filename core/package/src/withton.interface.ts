import { WithTonConnectionError } from './errors'
import { TonAccount, WalletDetails, ConnectionSource, HTTPConnectionSource } from './blueprints'
import { TransactionRequest, TransactionResponse } from './blueprints/methods'
import { ConnectRequest } from './blueprints/methods/connect/request'
import { WalletDetailsUnion } from './blueprints/wallet/info'
import { JSConnectionSource } from './blueprints/wallet/connect'

export interface IWithTon {
  isConnected?: boolean;
  account?: TonAccount | null;
  wallet?: WalletDetails;

  /**
   * Checks if the connection is paused.
   */
  isPaused(): boolean;

  /**
   * A utility method to check if there's a valid session to restore before calling `restore`.
   */
  hasSession(): boolean;

  /**
   * Validates if the current account has enough balance to send a transaction.
   */
  validateBalance(minBalance: number): boolean;

  // Fetches available wallet list
  wallets(): Promise<WalletDetailsUnion[]>;
  // Subscribes to wallet changes, and handles errors
  status(
    cb: (wallet: WalletDetails | null) => void,
    error?: (error: WithTonConnectionError) => void
  ): () => void;

  // Connects to a wallet, returns a link for external wallet
  join<T extends ConnectionSource | Pick<HTTPConnectionSource, 'bridgeLink'>[]>(
    wallet?: T,
    request?: ConnectRequest
  ): T extends JSConnectionSource ? void : string;

  // Restores session and reconnects to wallet
  restore(options?: { openingDeadline?: number; signal?: AbortSignal }): Promise<void>;

  // Pauses the connection
  pause(): void;

  // Unpauses the connection
  unpause(): Promise<void>;

  // Disconnects from the wallet
  disconnect(options?: { signal?: AbortSignal }): Promise<void>;

  // Sends a transaction to the connected wallet
  sendTransaction(
    transaction: TransactionRequest,
    options?: { onRequest?: () => void; signal?: AbortSignal }
  ): Promise<TransactionResponse>;

  // Overloaded method for sending transaction
  sendTransaction(
    transaction: TransactionRequest,
    onRequest?: () => void
  ): Promise<TransactionResponse>;
}
