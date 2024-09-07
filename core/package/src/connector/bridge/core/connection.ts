import {
  DeviceInfo,
  KeyGen,
  SessionCrypto,
  TonAddressItem,
} from "@withton/bridge";
import { BridgeSession } from "./session";
import { HTTPConnectionSource } from "../../../blueprints";
import { BridgeRaw } from "./raw";
import { MakeOptional } from "../../../helpers/types";

/**
 * Represents a union of different types of connections.
 */
export type Connection =
  | HttpConnection
  | PendingHttpConnection
  | InjectedConnection;

/**
 * Represents an injected connection, typically from a browser extension or embedded JavaScript.
 */
export interface InjectedConnection {
  type: "injected";
  jsBridgeKey: string;
  nextRequestId: number;
}

/**
 * Represents an active HTTP connection in the bridge system.
 */
export interface HttpConnection {
  type: "http";
  lastEventId?: number;
  nextRequestId: number;
  connectionEvent: {
    eventType: "connected";
    details: {
      addresses: TonAddressItem[];
      deviceInfo: DeviceInfo;
    };
  };
  session: BridgeSession;
}

/**
 * Represents a pending HTTP connection with session crypto information.
 */
export interface PendingHttpConnection {
  type: "http";
  sessionCrypto: SessionCrypto;
  connectionSource:
    | MakeOptional<HTTPConnectionSource, "universalLink">
    | Pick<HTTPConnectionSource, "bridgeLink">[];
}

/**
 * Type guard to determine if a connection is a pending HTTP connection.
 */
export function isPendingHttpConnection(
  connection: PendingHttpConnection | HttpConnection,
): connection is PendingHttpConnection {
  return !("connectionEvent" in connection);
}

/**
 * Represents a raw version of an HTTP connection with raw session data.
 */
export type RawHttpConnection = Omit<HttpConnection, "session"> & {
  session: BridgeRaw;
};

/**
 * Represents a raw version of a pending HTTP connection with raw cryptographic data.
 */
export type RawPendingHttpConnection = Omit<
  PendingHttpConnection,
  "sessionCrypto"
> & {
  sessionCrypto: KeyGen;
};

/**
 * Represents a union of raw connection types.
 */
export type RawConnection =
  | RawHttpConnection
  | RawPendingHttpConnection
  | InjectedConnection;
