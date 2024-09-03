import { ConnectionEvent } from "./connect";
import { DisconnectEvent } from "./disconnect";

export type WalletEvent = ConnectionEvent | DisconnectEvent;
