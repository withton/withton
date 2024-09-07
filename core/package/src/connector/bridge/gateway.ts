import { Base64, RPC } from "@withton/bridge";
import { WithTonConnectionError } from "../../errors";
import { BridgeIMessage } from "./core/IMessage";
import { HttpBridgeStorage } from "../../storage/http";
import { StorageType } from "../../storage/models/types";
import { appendPathToUrl } from "../../helpers/tg-url-formater";
import { onSuccess } from "../../helpers/onSuccess";
import { loggerDebug, loggerError } from "../../helpers/logger";
import { manageResource } from "../../helpers/data-provider";
import { executeWithTimeout } from "../../helpers/timeout";
import { createAbortManager } from "../../helpers/abortManager";

export class ConnectorGeteway {
  private readonly ssePath = "events";
  private readonly postPath = "message";
  private readonly heartbeatMessage = "heartbeat";
  private readonly defaultTTL = 300;
  private readonly defaultReconnectDuration = 2000;
  private readonly defaultResendDuration = 5000;

  private eventSource = manageResource(
    async (
      signal?: AbortSignal,
      openingDeadlines?: number,
    ): Promise<EventSource> => {
      const config = {
        bridgeUrl: this.bridgeLink,
        ssePath: this.ssePath,
        sessionId: this.sessionId,
        bridgeGatewayStorage: this.brigetGetwayBridge,
        errorHandler: this.errorsHandler.bind(this),
        messageHandler: this.messagesHandler.bind(this),
        signal: signal,
        openingDeadlineMS: openingDeadlines,
      };
      return await createEventSource(config);
    },
    async (resource: EventSource) => {
      resource.close();
    },
  );

  private get isReady(): boolean {
    const eventSource = this.eventSource.getActiveResource();
    return eventSource?.readyState === EventSource.OPEN;
  }
  private get isClose(): boolean {
    const eventSource = this.eventSource.getActiveResource();
    return eventSource?.readyState !== EventSource.OPEN;
  }
  private get isConnecting(): boolean {
    const eventSource = this.eventSource.getActiveResource();
    return eventSource?.readyState === EventSource.CONNECTING;
  }
  private readonly brigetGetwayBridge: HttpBridgeStorage;

  constructor(
    storage: StorageType,
    public readonly bridgeLink: string,
    public readonly sessionId: string,
    private listener: (msg: BridgeIMessage) => void,
    private errorsListener: (err: Event) => void,
  ) {
    this.brigetGetwayBridge = new HttpBridgeStorage(storage, bridgeLink);
  }

  public async registerSession(options: RegisterSessionOptions): Promise<void> {
    await this.eventSource?.initialize(
      options?.signal,
      options?.openingDeadline,
    );
  }

  public async send(
    message: Uint8Array,
    reciver?: string,
    topic?: RPC,
    options?: {
      ttl?: number;
      sigal?: AbortSignal;
      attempts?: number;
    },
  ): Promise<void>;

  public async send(
    message: Uint8Array,
    reciver?: string,
    topic?: RPC,
    ttl?: number,
  ): Promise<void>;

  public async send(
    message: Uint8Array,
    reciver?: string,
    topic?: RPC,
    ttlOptions?:
      | number
      | { ttl?: number; signal?: AbortSignal; attempts?: number },
  ): Promise<void> {
    const options: { ttl?: number; signal?: AbortSignal; attempts?: number } =
      {};
    if (typeof ttlOptions === "number") {
      options.ttl = ttlOptions;
    } else {
      options.ttl = ttlOptions?.ttl;
      options.signal = ttlOptions?.signal;
      options.attempts = ttlOptions?.attempts;
    }

    const reciverValue = reciver ?? "defaultReceiver";
    const topicValue = topic ?? "defaultTopic";

    const url = new URL(appendPathToUrl(this.bridgeLink, this.postPath));
    url.searchParams.append("client_id", this.sessionId);
    url.searchParams.append("to", reciverValue);
    url.searchParams.append(
      "ttl",
      (options?.ttl || this.defaultTTL).toString(),
    );
    url.searchParams.append("topic", topicValue);
    const body = Base64.encode(message);

    await onSuccess(
      async (options) => {
        const response = await this.post(url, body, options?.signal);

        if (!response?.ok) {
          throw new WithTonConnectionError(
            `Bridge send failed, status ${response.status}`,
          );
        }
      },
      {
        attempts: options?.attempts ?? Number.MAX_SAFE_INTEGER,
        timeoutInMilliseconds: this.defaultResendDuration,
        signal: options?.signal,
      },
    );
  }

  public pause(): void {
    this.eventSource
      ?.cleanup()
      .catch((e) => loggerError(`Bridge pause failed, ${e}`));
  }
  public async unPause(): Promise<void> {
    const RECREATE_WITHOUT_DELAY = 0;
    await this.eventSource.reinitialize(RECREATE_WITHOUT_DELAY);
  }
  public async close(): Promise<void> {
    await this.eventSource
      ?.cleanup()
      .catch((e) => loggerError(`Bridge close failed, ${e}`));
  }
  public setListener(listener: (msg: BridgeIMessage) => void): void {
    this.listener = listener;
  }
  public setErrorsListener(errors: (err: Event) => void): void {
    this.errorsListener = errors;
  }

  private async post(
    url: URL,
    body: string,
    signal?: AbortSignal,
  ): Promise<Response> {
    const response = await fetch(url, {
      method: "post",
      body: body,
      signal: signal,
    });

    if (!response.ok) {
      throw new WithTonConnectionError(
        `Bridge send failed, status ${response.status}`,
      );
    }

    return response;
  }
  private async errorsHandler(
    eventSource: EventSource,
    e: Event,
  ): Promise<EventSource | void> {
    if (this.isConnecting) {
      eventSource.close();
      throw new WithTonConnectionError("Bridge error, failed to connect");
    }

    if (this.isReady) {
      try {
        this.errorsListener(e);
      } catch (e) {}
      return;
    }

    if (this.isClose) {
      eventSource.close();
      loggerDebug(
        `Bridge reconnecting, ${this.defaultReconnectDuration}ms delay`,
      );
      return await this.eventSource.reinitialize(this.defaultReconnectDuration);
    }

    throw new WithTonConnectionError("Bridge error, unknown state");
  }
  private async messagesHandler(e: MessageEvent<string>): Promise<void> {
    if (e.data === this.heartbeatMessage) {
      return;
    }

    await this.brigetGetwayBridge.storeLastEventId(e.lastEventId);

    if (this.isClose) {
      return;
    }

    let bridgeIncomingMessage: BridgeIMessage;
    try {
      bridgeIncomingMessage = JSON.parse(e.data);
    } catch (e: any) {
      throw new WithTonConnectionError(
        `Bridge message parse failed, message ${e.data}`,
      );
    }
    this.listener(bridgeIncomingMessage);
  }
}

export type RegisterSessionOptions = {
  /**
   * Deadline for opening the event source.
   */
  openingDeadline?: number;

  /**
   * Signal to abort the operation.
   */
  signal?: AbortSignal;
};

export type CreateEventSourceConfig = {
  /**
   * URL of the bridge.
   */
  bridgeUrl: string;
  /**
   * Path to the SSE endpoint.
   */
  ssePath: string;
  /**
   * Session ID of the client.
   */
  sessionId: string;
  /**
   * Storage for the last event ID.
   */
  bridgeGatewayStorage: HttpBridgeStorage;
  /**
   * Error handler for the event source.
   */
  errorHandler: (
    eventSource: EventSource,
    e: Event,
  ) => Promise<EventSource | void>;
  /**
   * Message handler for the event source.
   */
  messageHandler: (e: MessageEvent<string>) => void;
  /**
   * Signal to abort opening the event source and destroy it.
   */
  signal?: AbortSignal;
  /**
   * Deadline for opening the event source.
   */
  openingDeadlineMS?: number;
};

async function createEventSource(
  config: CreateEventSourceConfig,
): Promise<EventSource> {
  return await executeWithTimeout(
    async (resolve, reject, deferOptions) => {
      const abortManager = createAbortManager(deferOptions?.externalSignal);
      const signal = abortManager?.signal;

      if (signal.aborted) {
        reject(new WithTonConnectionError("Bridge connection aborted"));
        return;
      }

      const url = new URL(appendPathToUrl(config.bridgeUrl, config.ssePath));
      url.searchParams.append("client_id", config.sessionId);

      const lastEventId = await config.bridgeGatewayStorage.getLastEventId();
      if (lastEventId) {
        url.searchParams.append("last_event_id", lastEventId);
      }
      const eventSource = new EventSource(url.toString());

      eventSource.onerror = async (reason: Event): Promise<void> => {
        if (signal?.aborted) {
          eventSource.close();
          reject(new WithTonConnectionError("Bridge connection aborted"));
          return;
        }
        try {
          const newInstance = await config.errorHandler(eventSource, reason);
          if (newInstance !== eventSource) {
            eventSource.close();
          }
          if (newInstance && newInstance != eventSource) {
            resolve(newInstance);
          }
        } catch (e) {
          eventSource.close();
          reject(e);
        }
      };
      eventSource.onopen = (): void => {
        if (signal?.aborted) {
          eventSource.close();
          reject(new WithTonConnectionError("Birdge connection aborted"));
          return;
        }
        resolve(eventSource);
      };
      eventSource.onmessage = (event: MessageEvent<string>): void => {
        if (signal?.aborted) {
          eventSource.close();
          reject(new WithTonConnectionError("Bridge connection aborted"));
          return;
        }
        config.messageHandler(event);
      };
      config?.signal?.addEventListener("abort", () => {
        eventSource.close();
        reject(new WithTonConnectionError("Bridge connection aborted"));
      });
    },
    {
      timeoutDuration: config.openingDeadlineMS,
      externalSignal: config?.signal,
    },
  );
}
