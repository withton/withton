import { WithTonConnectionError } from "../../errors";
import {
  HTTPConnectionSource,
  ConnectionSource,
} from "../../blueprints/wallet/connect";

import {
  App,
  Base64,
  ConnectionEvent,
  ConnectionRequest,
  hexToBytes,
  RPC,
  SessionCrypto,
  TonAddressItem,
  WalletEvent,
  WalletMessage,
  WalletResponse,
} from "@withton/bridge";

import { ConnectorGeteway } from "../../connector/bridge/gateway";
import {
  HttpConnection,
  isPendingHttpConnection,
} from "../../connector/bridge/core/connection";

import { BridgeIMessage } from "./core/IMessage";
import { BridgeSession, BridgeSessionType } from "./core/session";
import { ConnectionManager } from "../../storage/connect";
import { StorageType } from "../../storage/models/types";
import {
  MakeOptional,
  RemoveId,
  DistributiveRemoveId,
} from "../../helpers/types";

import { BRIDGE_VERSION } from "../../config/bridge";
import { loggerDebug, loggerError } from "../../helpers/logger";
import {
  isTelegramLink,
  encodeTelegramParams,
} from "../../helpers/tg-url-formater";
import { onSuccess } from "../../helpers/onSuccess";
import { createAbortManager } from "../../helpers/abortManager";



export class ConnectorProvider implements HttpConnection {}
