import {
  ConnectionRequest,
  ConnectionEvent,
  App,
  DeviceInfo,
  RPC,
  WalletEvent,
  WalletResponse,
} from "@withton/bridge";

import { WalletInfoDTO } from "../../../blueprints/wallet";
import { hasKey, hasKeys } from "../../../helpers/types";

export interface API {
  device: DeviceInfo;
  wallet: Pick<
    WalletInfoDTO,
    | "name"
    | "appName"
    | "tonDns"
    | "iconUrl"
    | "aboutUrl"
    | "platforms"
    | "universalLink"
    | "bridge"
  >;
  bridge_version: number;
  isBrowser: boolean;
  connectionState?: string;
  version?: string;
  metadata?: Record<string, unknown>;
  connect(
    bridge_version: number,
    message: ConnectionRequest,
  ): Promise<ConnectionEvent>;
  restore(): Promise<ConnectionEvent>;
  send<T extends RPC>(message: App<T>): Promise<WalletResponse<T>>;
  listen(cb: (event: WalletEvent) => void): () => void;
  disconnect(): void;
}

export function isBridgeWithMetaData(
  value: unknown,
): value is { withton: API } {
  try {
    if (!hasKey(value, "withton") || !hasKey(value?.withton, "info")) {
      return false;
    }

    const walletInfoKeys = [
      "name",
      "appName",
      "iconUrl",
      "aboutUrl",
      "platforms",
      "tonDns",
      "universalLink",
    ];

    if (!hasKeys(value.withton.info, walletInfoKeys)) {
      return false;
    }

    // Optionally, validate info and metadata if needed
    if (typeof value.withton.info !== "number") {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}
