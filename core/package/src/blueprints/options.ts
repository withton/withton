import { StorageType } from "../storage/models/types";
import { EventDispatcher } from "../monitor/dispatcher";
import { PackageAction } from "../monitor/types";

/**
 * Configuration options for the WitnTon Connector.
 */
export interface WitnTonConnectorOptions {
  /**
   * Optional metadata string that can be used for additional information
   * about the connection or session.
   * Example: Could contain user session data or app-specific details.
   */
  metaData?: string;

  /**
   * The storage type used by the connector, which defines how
   * the connection state and data will be stored (e.g., in-memory, local storage, etc.).
   */
  storage: StorageType;

  /**
   * Event dispatcher responsible for sending and handling connection-related
   * events such as connection success, failure, or status updates.
   */
  eventDispatcher?: EventDispatcher<PackageAction>;

  /**
   * String containing wallet details, such as a wallet address or a wallet type,
   * used to initiate or maintain a connection with the wallet.
   */
  wallets: string;

  /**
   * Optional time-to-live in milliseconds (TTL), which defines how long
   * the connection can remain open before it is automatically closed.
   */
  TTMLS?: number;

  /**
   * A flag indicating whether the connection should be paused temporarily.
   * When true, it prevents the connection from initiating or proceeding.
   */
  pauseConnection: boolean;
}
