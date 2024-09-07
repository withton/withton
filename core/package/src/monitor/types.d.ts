import {
  CONNECTION_ERROR_CODE,
  SEND_TRANSACTION_ERROR_CODE,
  ConnectItem,
} from "@withton/bridge";
import {
  TransactionRequest,
  TransactionResponse,
  ConnectedWallet,
} from "../blueprints";

// Define the request type
export type RequestType = {
  type: "post";
};

// Function to create a package version request
export function createPackageVersionRequest(): RequestType {
  return {
    type: "post",
  };
}

// Define the response type with versioning
export type ResponseType = {
  type: "get";
  version: string;
};

// Function to retrieve the package version
export function getPackageVersion(version?: string): ResponseType {
  return {
    type: "get",
    version: version ?? "1.0.0", // Provide a default version
  };
}

// Union type for version event requests and responses
export type VersionEvent = RequestType | ResponseType;

// Define the version information type
export type VersionInfo = {
  sdkVersion: string | null;
  toolkitVersion: string | null;
};

// Function to create version information
export function createVersionInfo(versionInfo: VersionInfo): VersionInfo {
  return {
    sdkVersion: versionInfo.sdkVersion,
    toolkitVersion: versionInfo.toolkitVersion,
  };
}

// Define the authentication type based on ConnectItem's name
export type AuthenticationType = ConnectItem["name"];

// Connection information with nested version data
export type ConnectionDetails = {
  walletAddress: string | null;
  connectionType: string | null;
  appVersion: string | null;
  authType: AuthenticationType;
  connectionMeta: {
    network: string | null;
    providerType: "http" | "injected" | null;
  } & VersionInfo;
};

function createConnectionInfo(
  version: VersionInfo,
  wallet: ConnectedWallet | null,
): ConnectionDetails {
  const isWalletSignature =
    wallet?.connectionItems?.walletSignature &&
    "ton_proof" in wallet.connectionItems.walletSignature;
  const authenticationType: AuthenticationType = isWalletSignature
    ? "ton_proof"
    : "ton_address";

  return {
    walletAddress: wallet?.account?.address ?? null,
    connectionType: wallet?.device?.appName ?? null,
    appVersion: wallet?.device?.appVersion ?? null,
    authType: authenticationType,
    connectionMeta: {
      network: wallet?.account?.network ?? null,
      providerType: wallet?.providerType ?? null,
      ...createVersionInfo(version),
    },
  };
}
// Event triggered when a connection is initiated
export type ConnectionInitiatedEvent = {
  type: "initiated";
  versionDetails: VersionInfo;
};

// Function to create a connection initiated event
export function createConnectionInitiatedEvent(
  versionInfo: VersionInfo,
): ConnectionInitiatedEvent {
  return {
    type: "initiated",
    versionDetails: createVersionInfo(versionInfo),
  };
}

// Event triggered when a connection is successfully completed
export type ConnectionSuccessEvent = {
  type: "success";
  isSuccess: true;
} & ConnectionDetails;

// Function to create a connection completed event
export function createConnectionSuccessEvent(
  versionInfo: VersionInfo,
  connectedWallet: ConnectedWallet | null,
): ConnectionSuccessEvent {
  return {
    type: "success",
    isSuccess: true,
    ...createConnectionInfo(versionInfo, connectedWallet),
  };
}
/**
 * Represents an event where the connection has encountered an error.
 */
export type ConnectionErrorEvent = {
  type: "error";
  isSuccess: false;
  message: string;
  errorCode: CONNECTION_ERROR_CODE | null;
  versionInfo: VersionInfo;
};

/**
 * Creates a ConnectionErrorEvent.
 * @param versionInfo The version information of the connection.
 * @param errorMessage The error message explaining the failure.
 * @param errorCode Optional error code representing the connection failure.
 * @returns ConnectionErrorEvent
 */
export function createConnectionErrorEvent(
  versionInfo: VersionInfo,
  errorMessage: string,
  errorCode: CONNECTION_ERROR_CODE | void,
): ConnectionErrorEvent {
  return {
    type: "error",
    isSuccess: false,
    errorCode: errorCode ?? null,
    message: errorMessage,
    versionInfo: createVersionInfo(versionInfo),
  };
}

/**
 * Represents various possible connection events, either initiated or errored.
 */
export type ConnectionEvent = ConnectionInitiatedEvent | ConnectionErrorEvent;

/**
 * Represents an event when a connection restoration starts.
 */
export type ConnectionRestoringStartEvent = {
  type: "restoring-started";
  versionInfo: VersionInfo;
};

/**
 * Creates a ConnectionRestoringStartEvent.
 * @param versionInfo The version information of the connection.
 * @returns ConnectionRestoringStartEvent
 */
export function createConnectionRestoringStartEvent(
  versionInfo: VersionInfo,
): ConnectionRestoringStartEvent {
  return {
    type: "restoring-started",
    versionInfo: createVersionInfo(versionInfo),
  };
}

/**
 * Represents an event when connection restoration has successfully completed.
 */
export type ConnectionRestoringSuccessEvent = {
  type: "restoring-completed";
  isSuccess: true;
} & ConnectionDetails;

/**
 * Creates a ConnectionRestoringSuccessEvent.
 * @param versionInfo The version information of the connection.
 * @param connectedWallet The connected wallet details.
 * @returns ConnectionRestoringSuccessEvent
 */
export function createConnectionRestoringSuccessEvent(
  versionInfo: VersionInfo,
  connectedWallet: ConnectedWallet | null,
): ConnectionRestoringSuccessEvent {
  return {
    type: "restoring-completed",
    isSuccess: true,
    ...createConnectionInfo(versionInfo, connectedWallet),
  };
}

// Event representing an error during connection restoration
export type ConnectionRestoringErrorEvent = {
  /**
   * Event type.
   */
  type: "restoring-error";
  /**
   * Connection success flag.
   */
  isSuccess: false;
  /**
   * Error message describing the reason for the failure.
   */
  errorMessage: string;
  /**
   * Additional data for the connection.
   */
  versionInfo: VersionInfo;
};

/**
 * Creates a ConnectionRestoringErrorEvent.
 * @param versionInfo The version information for the connection.
 * @param errorMessage The error message explaining the issue.
 */
export function createConnectionRestoringErrorEvent(
  versionInfo: VersionInfo,
  errorMessage: string,
): ConnectionRestoringErrorEvent {
  return {
    type: "restoring-error",
    isSuccess: false,
    errorMessage,
    versionInfo: createVersionInfo(versionInfo),
  };
}

/**
 * Union type representing all possible connection restoring events.
 */
export type ConnectionRestoringEvent =
  | ConnectionRestoringStartEvent
  | ConnectionRestoringSuccessEvent
  | ConnectionRestoringErrorEvent;

/**
 * Represents a transaction message with the recipient's address and amount.
 */
export type TransactionMessage = {
  /**
   * Recipient's address.
   */
  address: string | null;
  /**
   * Amount to transfer.
   */
  amount: string | null;
};

/**
 * Represents detailed information about a transaction.
 */
export type TransactionInfo = {
  /**
   * Timestamp indicating the validity of the transaction.
   */
  validUntil: string | null;
  /**
   * Address of the sender.
   */
  senderAddress: string | null;
  /**
   * List of messages associated with the transaction.
   */
  messages: TransactionMessage[];
};

/**
 * Creates the transaction information object from the provided wallet and transaction data.
 * @param wallet The wallet from which the transaction originates.
 * @param transaction The transaction request object.
 */
function createTransactionInfo(
  wallet: Wallet | null,
  transaction: SendTransactionRequest,
): TransactionInfo {
  return {
    validUntil: String(transaction.validUntil) ?? null,
    senderAddress: transaction.from ?? wallet?.account?.address ?? null,
    messages: transaction.messages.map((message) => ({
      address: message.address ?? null,
      amount: message.amount ?? null,
    })),
  };
}

/**
 * Represents the event when a transaction is sent for signature.
 */
export type TransactionSentForSignatureEvent = {
  /**
   * Event type indicating the transaction has been sent for signing.
   */
  type: "transaction-sent-for-signature";
} & ConnectionDetails &
  TransactionInfo;

/**
 * Creates an event for when a transaction is sent for signature.
 * @param versionInfo The version information for the connection.
 * @param wallet The wallet details associated with the transaction.
 * @param transaction The transaction request object.
 */
export function createTransactionSentForSignatureEvent(
  versionInfo: VersionInfo,
  wallet: Wallet | null,
  transaction: SendTransactionRequest,
): TransactionSentForSignatureEvent {
  return {
    type: "transaction-sent-for-signature",
    ...createConnectionInfo(versionInfo, wallet),
    ...createTransactionInfo(wallet, transaction),
  };
}

/**
 * Event when a transaction is successfully signed by the user.
 */
export type TransactionSignedEvent = {
  /**
   * Event type.
   */
  type: "transaction-signed";
  /**
   * Indicates a successful transaction signing.
   */
  isSuccess: true;
  /**
   * The signed transaction (BOC format).
   */
  signedTransaction: string;
} & ConnectionDetails &
  TransactionInfo;

/**
 * Create a transaction signed event.
 * @param versionInfo - The connection version information.
 * @param wallet - The wallet details.
 * @param transaction - The transaction request details.
 * @param signedTransaction - The signed transaction response.
 */
export function createTransactionSignedEvent(
  versionInfo: VersionInfo,
  wallet: Wallet | null,
  transaction: SendTransactionRequest,
  signedTransaction: SendTransactionResponse,
): TransactionSignedEvent {
  return {
    type: "transaction-signed",
    isSuccess: true,
    signedTransaction: signedTransaction.boc,
    ...createConnectionInfo(versionInfo, wallet),
    ...createTransactionInfo(wallet, transaction),
  };
}

/**
 * Event when a transaction signing fails or is canceled by the user.
 */
export type TransactionSigningFailedEvent = {
  /**
   * Event type.
   */
  type: "transaction-signing-failed";
  /**
   * Indicates the transaction signing has failed.
   */
  isSuccess: false;
  /**
   * Reason for the failure or cancellation.
   */
  errorMessage: string;
  /**
   * The error code, if available.
   */
  errorCode: SEND_TRANSACTION_ERROR_CODES | null;
} & ConnectionDetails &
  TransactionInfo;

/**
 * Create a transaction signing failed event.
 * @param versionInfo - The connection version information.
 * @param wallet - The wallet details.
 * @param transaction - The transaction request details.
 * @param errorMessage - A message explaining the reason for failure.
 * @param errorCode - The error code if applicable.
 */
export function createTransactionSigningFailedEvent(
  versionInfo: VersionInfo,
  wallet: Wallet | null,
  transaction: SendTransactionRequest,
  errorMessage: string,
  errorCode: SEND_TRANSACTION_ERROR_CODES | void,
): TransactionSigningFailedEvent {
  return {
    type: "transaction-signing-failed",
    isSuccess: false,
    errorMessage,
    errorCode: errorCode ?? null,
    ...createConnectionInfo(versionInfo, wallet),
    ...createTransactionInfo(wallet, transaction),
  };
}

/**
 * Represents all possible transaction signing events.
 */
export type TransactionSigningEvent =
  | TransactionSentForSignatureEvent
  | TransactionSignedEvent
  | TransactionSigningFailedEvent;

/**
 * Event when a user initiates a disconnection.
 */
export type DisconnectionEvent = {
  /**
   * Event type.
   */
  type: "disconnection";
  /**
   * The scope of the disconnection, either 'dapp' or 'wallet'.
   */
  scope: "dapp" | "wallet";
} & ConnectionDetails;

/**
 * Create a disconnection event.
 * @param versionInfo - The connection version information.
 * @param wallet - The wallet details.
 * @param scope - The scope of the disconnection.
 */
export function createDisconnectionEvent(
  versionInfo: VersionInfo,
  wallet: Wallet | null,
  scope: "dapp" | "wallet",
): DisconnectionEvent {
  return {
    type: "disconnection",
    scope,
    ...createConnectionInfo(versionInfo, wallet),
  };
}

export type PackageAction =
  | VersionEvent
  | ConnectionEvent
  | ConnectionRestoringEvent
  | DisconnectionEvent
  | TransactionSigningEvent
  | ConnectionSuccessEvent;

/**
 * A utility type that removes `VersionInfo` from a tuple type.
 * If `T` starts with `VersionInfo`, it returns the rest of the tuple.
 * Otherwise, it returns `never`.
 */
export type WithoutVersion<T> = T extends [VersionInfo, ...infer Rest]
  ? Rest
  : never;
