import type { RPC } from "../rpc";
import { WalletEvent } from "./event";
import { WalletResponse } from "./response";

export type WalletMessage = WalletEvent | WalletResponse<RPC>;
