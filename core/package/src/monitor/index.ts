import {
  createPackageVersionRequest,
  ResponseType,
  getPackageVersion,
  VersionInfo,
  createVersionInfo,
  createConnectionSuccessEvent,
  PackageAction,
  createConnectionErrorEvent,
  createConnectionRestoringSuccessEvent,
  createConnectionRestoringStartEvent,
  createConnectionRestoringErrorEvent,
  createDisconnectionEvent,
  createTransactionSentForSignatureEvent,
  createTransactionSignedEvent,
  createTransactionSigningFailedEvent,
} from "./types";
import { AddWithTonPrefix, EventDispatcher } from "./dispatcher";
import { Browser } from "./browser";
import {
  ConnectedWallet,
  TransactionRequest,
  TransactionResponse,
} from "../blueprints";
import {
  CONNECTION_ERROR_CODE,
  SEND_TRANSACTION_ERROR_CODE,
} from "@withton/bridge";

export type WithTonMonitorOptions = {
  eventDispatcher?: EventDispatcher<PackageAction> | null;
  version: string;
};

export class WithTonMonitor {
  private readonly eventPrefix = "withton-";
  private readonly sdkVersion: string;
  private toolkitVersion: string | null = null;

  public readonly eventDispatcher: EventDispatcher<PackageAction>;

  /**
   * Initializes the monitor with the SDK version and an event dispatcher.
   * @param options Contains the version and optional event dispatcher.
   */
  constructor(options: WithTonMonitorOptions) {
    this.sdkVersion = options.version;
    this.eventDispatcher = options.eventDispatcher ?? new Browser();
    this.init().catch(console.error);
  }

  /**
   * Provides version information including SDK and toolkit versions.
   */
  get version(): VersionInfo {
    return createVersionInfo({
      sdkVersion: this.sdkVersion,
      toolkitVersion: this.toolkitVersion,
    });
  }

  /**
   * Initializes the monitor by requesting the SDK and toolkit versions.
   */
  private async init(): Promise<void> {
    await this.requestVersion();
    this.toolkitVersion = await this.requestToolkitVersion();
  }

  /**
   * Requests and dispatches the SDK version.
   */
  private async requestVersion(): Promise<void> {
    await this.eventDispatcher.addEventListener(
      `${this.eventPrefix}post`,
      async () => {
        await this.eventDispatcher.dispatchEvent(
          `${this.eventPrefix}get`,
          getPackageVersion(this.sdkVersion),
        );
      },
    );
  }

  /**
   * Requests and retrieves the toolkit version asynchronously.
   */
  private async requestToolkitVersion(): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        await this.eventDispatcher.addEventListener(
          `${this.eventPrefix}kit-get`,
          (event: CustomEvent<ResponseType>) => resolve(event.detail.version),
          { once: true },
        );
        await this.eventDispatcher.dispatchEvent(
          `${this.eventPrefix}kit-post`,
          createPackageVersionRequest(),
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Dispatches a user action event with the provided event details.
   * @param eventDetails The details of the event being dispatched.
   */
  private async dispatchUserActionEvent(
    eventDetails: PackageAction,
  ): Promise<void> {
    try {
      const eventName: AddWithTonPrefix<PackageAction["type"]> =
        `${this.eventPrefix}${eventDetails.type}` as AddWithTonPrefix<
          PackageAction["type"]
        >;
      await this.eventDispatcher.dispatchEvent(eventName, eventDetails);
    } catch (error) {
      console.error("Error dispatching event:", error);
    }
  }

  /**
   * Monitors a successful connection.
   * @param wallet The connected wallet information.
   */
  public monitorConnection(wallet: ConnectedWallet): void {
    const event = createConnectionSuccessEvent(this.version, wallet);
    this.dispatchUserActionEvent(event).catch(console.error);
  }

  /**
   * Monitors a connection error.
   * @param errorMessage The error message describing the failure.
   * @param errorCode Optional error code for the failure.
   */
  public monitorError(
    errorMessage: string,
    errorCode?: CONNECTION_ERROR_CODE,
  ): void {
    const event = createConnectionErrorEvent(
      this.version,
      errorMessage,
      errorCode,
    );
    this.dispatchUserActionEvent(event).catch(console.error);
  }

  /**
   * Monitors the start of a connection restoration.
   */
  public monitorRestoringStarted(): void {
    const event = createConnectionRestoringStartEvent(this.version);
    this.dispatchUserActionEvent(event).catch(console.error);
  }

  /**
   * Monitors the completion of a connection restoration.
   * @param wallet The restored wallet information.
   */
  public monitorRestoringCompleted(wallet: ConnectedWallet | null): void {
    const event = createConnectionRestoringSuccessEvent(this.version, wallet);
    this.dispatchUserActionEvent(event).catch(console.error);
  }

  /**
   * Monitors an error during connection restoration.
   * @param errorMessage The error message describing the restoration failure.
   */
  public monitorConnectionRestoringError(errorMessage: string): void {
    const event = createConnectionRestoringErrorEvent(
      this.version,
      errorMessage,
    );
    this.dispatchUserActionEvent(event).catch(console.error);
  }

  /**
   * Monitors a disconnection event.
   * @param wallet The wallet that was disconnected.
   * @param scope Specifies whether the disconnection is for a dApp or wallet.
   */
  public monitorDisconnection(
    wallet: ConnectedWallet | null,
    scope: "dapp" | "wallet",
  ): void {
    const event = createDisconnectionEvent(this.version, wallet, scope);
    this.dispatchUserActionEvent(event).catch(console.error);
  }

  /**
   * Monitors when a transaction is sent for signature.
   * @param wallet The wallet sending the transaction.
   * @param transaction The transaction request details.
   */
  public monitorTransactionSentForSignature(
    wallet: ConnectedWallet | null,
    transaction: TransactionRequest,
  ): void {
    const event = createTransactionSentForSignatureEvent(
      this.version,
      wallet,
      transaction,
    );
    this.dispatchUserActionEvent(event).catch(console.error);
  }

  /**
   * Monitors when a transaction is signed successfully.
   * @param wallet The wallet signing the transaction.
   * @param transaction The transaction request details.
   * @param signedTransaction The signed transaction response.
   */
  public monitorTransactionSigned(
    wallet: ConnectedWallet | null,
    transaction: TransactionRequest,
    signedTransaction: TransactionResponse,
  ): void {
    const event = createTransactionSignedEvent(
      this.version,
      wallet,
      transaction,
      signedTransaction,
    );
    this.dispatchUserActionEvent(event).catch(console.error);
  }

  /**
   * Monitors when a transaction signing fails.
   * @param wallet The wallet involved in the transaction.
   * @param transaction The transaction request details.
   * @param errorMessage The error message describing the failure.
   * @param errorCode Optional error code for the failure.
   */
  public monitorTransactionSigningFailed(
    wallet: ConnectedWallet | null,
    transaction: TransactionRequest,
    errorMessage: string,
    errorCode?: SEND_TRANSACTION_ERROR_CODE,
  ): void {
    const event = createTransactionSigningFailedEvent(
      this.version,
      wallet,
      transaction,
      errorMessage,
      errorCode,
    );
    this.dispatchUserActionEvent(event).catch(console.error);
  }
}
