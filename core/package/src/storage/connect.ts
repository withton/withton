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

type NonNullableStoredConnection = RawConnection & { type: Connection["type"] };
type ValidConnection =
  | HttpConnection
  | InjectedConnection
  | PendingHttpConnection;

export class ConnectionManager {
  private readonly storageKey: string = "withton-connection-data";

  constructor(private readonly storage: MemoryStorage) {}

  public async saveConnection(connection: Connection): Promise<void> {
    let connectionData: string;

    if (connection.type === "injected") {
      connectionData = JSON.stringify(connection);
    } else if (!isPendingHttpConnection(connection)) {
      const rawConnection: BridgeRaw = {
        sessionKey: connection.session.sessionCrypto.stringifyKeyGen(),
        publicKey: connection.session.publicKey,
        bridgeLink: connection.session.bridgeLink,
      };

      const httpConnection: RawHttpConnection = {
        type: "http",
        connectionEvent: connection.connectionEvent,
        session: rawConnection,
        lastEventId: connection.lastEventId,
        nextRequestId: connection.nextRequestId,
      };
      connectionData = JSON.stringify(httpConnection);
    } else {
      const pendingHttpConnection: RawPendingHttpConnection = {
        type: "http",
        connectionSource: connection.connectionSource,
        sessionCrypto: connection.sessionCrypto.stringifyKeyGen(),
      };
      connectionData = JSON.stringify(pendingHttpConnection);
    }

    await this.storage.setItem(this.storageKey, connectionData);
  }

  // Clear stored connection
  public async clearConnection(): Promise<void> {
    await this.storage.removeItem(this.storageKey);
  }

  private async retrieveRawConnection(): Promise<NonNullableStoredConnection | null> {
    const storedConnection = await this.storage.getItem(this.storageKey);
    if (!storedConnection) return null;

    try {
      const parsedConnection: unknown = JSON.parse(storedConnection);
      if (this.isValidConnection(parsedConnection)) {
        return parsedConnection;
      }
      throw new WithTonConnectionError("Invalid stored connection format.");
    } catch (error) {
      throw new WithTonConnectionError("Failed to parse stored connection.");
    }
  }

  private isValidConnection(
    connection: unknown,
  ): connection is NonNullableStoredConnection {
    return (
      typeof connection === "object" &&
      connection !== null &&
      "type" in connection
    );
  }

  // Retrieve and return a strongly typed connection
  public async getConnection(): Promise<ValidConnection | null> {
    const connection = await this.retrieveRawConnection();
    if (!connection) return null;

    if (connection.type === "injected") return connection;

    if ("connectionEvent" in connection) {
      const session = new SessionCrypto(connection.session.sessionKey);
      return {
        type: "http",
        connectionEvent: connection.connectionEvent,
        lastEventId: connection.lastEventId,
        nextRequestId: connection.nextRequestId,
        session: {
          sessionCrypto: session,
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

  // Retrieve only HTTP connections
  public async fetchHttpConnection(): Promise<
    HttpConnection | PendingHttpConnection
  > {
    const connection = await this.getConnection();
    if (!connection)
      throw new WithTonConnectionError("No HTTP connection found.");

    if (connection.type === "injected") {
      throw new WithTonConnectionError(
        "Expected HTTP connection, found injected.",
      );
    }

    return connection;
  }

  // Retrieve pending HTTP connection
  public async fetchPendingHttpConnection(): Promise<PendingHttpConnection> {
    const connection = await this.getConnection();
    if (!connection) throw new WithTonConnectionError("No connection stored.");

    if (connection.type === "injected") {
      throw new WithTonConnectionError(
        "Expected pending HTTP connection, found injected.",
      );
    }

    if (!isPendingHttpConnection(connection)) {
      throw new WithTonConnectionError(
        "Expected pending HTTP connection, found standard HTTP.",
      );
    }

    return connection;
  }

  // Retrieve injected connection
  public async fetchInjectedConnection(): Promise<InjectedConnection> {
    const connection = await this.getConnection();
    if (!connection) throw new WithTonConnectionError("No connection stored.");

    if (connection.type !== "injected") {
      throw new WithTonConnectionError(
        "Expected injected connection, found HTTP.",
      );
    }

    return connection;
  }

  // Return the type of the stored connection (http, injected, or null)
  public async getConnectionType(): Promise<Connection["type"] | null> {
    const connection = await this.retrieveRawConnection();
    return connection ? connection.type : null;
  }

  // Store the last event ID for an HTTP connection
  public async updateLastEventId(id: number): Promise<void> {
    const connection = await this.getConnection();

    // Narrow down to HttpConnection, as only this type has lastEventId
    if (connection?.type === "http" && !isPendingHttpConnection(connection)) {
      connection.lastEventId = id;
      await this.saveConnection(connection);
    } else {
      throw new WithTonConnectionError(
        "Connection does not support lastEventId update.",
      );
    }
  }

  // Get the last event ID, if available
  public async fetchLastEventId(): Promise<number | undefined> {
    const connection = await this.getConnection();

    if (connection?.type === "http" && !isPendingHttpConnection(connection)) {
      return connection.lastEventId;
    }

    return undefined;
  }

  // Increment and store the next request ID for HTTP connections
  public async incrementNextRequestId(): Promise<void> {
    const connection = await this.getConnection();
    if (connection?.type === "http" && "nextRequestId" in connection) {
      connection.nextRequestId = (connection.nextRequestId || 0) + 1;
      await this.saveConnection(connection);
    }
  }

  // Retrieve the next request ID, defaulting to 0 if not set
  public async fetchNextRequestId(): Promise<number> {
    const connection = await this.getConnection();
    return connection?.type === "http" && "nextRequestId" in connection
      ? connection.nextRequestId ?? 0
      : 0;
  }
}
