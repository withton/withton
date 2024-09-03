export type { TonAccount } from "./account";
export type { ConnectedWallet } from "./wallet";
export type {
  ConnectionSource,
  HTTPConnectionSource,
  JSConnectionSource,
} from "./connect";

export {
  isCurrentInjectedWallet,
  isCurrentEmbeddedWallet,
  isJsInjectableWallet,
  isHttpWallet,
  isDeprecatedInjectedWallet,
} from "./info";
export type {
  WalletDetails,
  HttpWalletDetails,
  JsInjectableWalletDetails,
  CurrentInjectedWalletDetails,
  CurrentEmbeddedWalletDetails,
  DeprecatedInjectedWalletDetails,
  WalletDetailsUnion,
  WalletInfoDTO,
  HttpBridgeDTO,
  JsBridgeDTO,
} from "./info";
