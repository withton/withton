import { SessionCrypto } from "@withton/bridge";
import { WithTonConnectionError } from "../config/connect.error";
import { BridgeRaw } from "../connector/bridge/core";
import {
  Connection,
  HttpConnection,
  RawConnection,
  InjectedConnection,
  RawHttpConnection,
  PendingHttpConnection,
  RawPendingHttpConnection,
  isPendingHttpConnection,
} from "../connector/bridge/core";
import { MemoryStorage } from "../storage/models/memory";

export class ConnectionManager {
  private readonly storageKey = "withton-connection-data";

  constructor(private readonly storage: MemoryStorage) { }

  public async storeConnection(connection: Connection): Promise<void> {
    if (connection.type === "injected") {
      return this.storage.setItem(this.storageKey, JSON.stringify(connection));
    }

    if (!isPendingHttpConnection(connection)) {
      const rawSession: BridgeRaw = {
        sessionKey: connection.session.sessionCrypto.stringifyKeyGen(),
        publicKey: connection.session.publicKey,
        bridgeLink: connection.session.bridgeLink,
      };

      const rawConnection: RawHttpConnection = {
        type: "http",
        connectionEvent: connection.connectionEvent,
        session: rawSession,
        lastEventId: connection.lastEventId,
        nextRequestId: connection.nextRequestId,
      };
      return this.storage.setItem(this.storageKey, JSON.stringify(rawConnection));
    }

    const rawConnection: RawPendingHttpConnection = {
      type: "http",
      connectionSource: connection.connectionSource,
      sessionCrypto: connection.sessionCrypto.stringifyKeyGen(),
    };

    return this.storage.setItem(this.storageKey, JSON.stringify(rawConnection));
  }

  public async removeConnection(): Promise<void> {
    return this.storage.removeItem(this.storageKey);
  }

  public async getConnection(): Promise<Connection | null> {
    const stored = await this.storage.getItem(this.storageKey);
    if (!stored) {
      return null;
    }

    const connection: RawConnection = JSON.parse(stored);

    if (connection.type === "injected") {
      return connection;
    }

    if ("connectionEvent" in connection) {
      const sessionCrypto = new SessionCrypto(connection.session.sessionKey);
      return {
        type: "http",
        connectionEvent: connection.connectionEvent,
        lastEventId: connection.lastEventId,
        nextRequestId: connection.nextRequestId,
        session: {
          sessionCrypto,
          bridgeLink: connection.session.bridgeLink,
          publicKey: connection.session.publicKey,
        },
      } as HttpConnection;
    }

    return {
      type: "http",
      sessionCrypto: new SessionCrypto(connection.sessionCrypto),
      connectionSource: connection.connectionSource,
    } as PendingHttpConnection;
  }

  public async getHttpConnection(): Promise<HttpConnection | PendingHttpConnection> {
    const connection = await this.getConnection();
    if (!connection) {
      throw new WithTonConnectionError("No HTTP connection found.");
    }

    if (connection.type === "injected") {
      throw new WithTonConnectionError("Expected HTTP connection, found injected.");
    }

    return connection;
  }

  public async getHttpPendingConnection(): Promise<PendingHttpConnection> {
    const connection = await this.getConnection();
    if (!connection) {
      throw new WithTonConnectionError("No connection stored.");
    }

    if (connection.type === "injected") {
      throw new WithTonConnectionError("Expected pending HTTP connection, found injected.");
    }

    if (!isPendingHttpConnection(connection)) {
      throw new WithTonConnectionError("Expected pending HTTP connection, found standard HTTP.");
    }

    return connection;
  }

  public async getInjectedConnection(): Promise<InjectedConnection> {
    const connection = await this.getConnection();

    if (!connection) {
      throw new WithTonConnectionError("No connection stored.");
    }

    if (connection?.type === "http") {
      throw new WithTonConnectionError("Expected injected connection, found HTTP.");
    }

    return connection;
  }

  public async storedConnectionType(): Promise<Connection["type"] | null> {
    const stored = await this.storage.getItem(this.storageKey);
    if (!stored) {
      return null;
    }
    const connection: Connection = JSON.parse(stored);
    return connection.type;
  }

  public async storeLastEventId(id: number): Promise<void> {
    const connection = await this.getConnection();
    if (connection && connection.type === "http" && !isPendingHttpConnection(connection)) {
      connection.lastEventId = id;
      return this.storeConnection(connection);
    }
  }

  public async getLastEventId(): Promise<number | undefined> {
    const connection = await this.getConnection();
    if (connection && "lastEventId" in connection) {
      return connection.lastEventId;
    }

    return undefined;
  }

  public async increaseNextRequestId(): Promise<void> {
    const connection = await this.getConnection();
    if (connection && "nextRequestId" in connection) {
      const lastId = connection.nextRequestId || 0;
      connection.nextRequestId = lastId + 1;
      return this.storeConnection(connection);
    }
  }

  public async getNextRequestId(): Promise<number> {
    const connection = await this.getConnection();
    if (connection && "nextRequestId" in connection) {
      return connection.nextRequestId || 0;
    }

    return 0;
  }
}
