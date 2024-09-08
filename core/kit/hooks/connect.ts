import {
  WalletDetails,
  JsInjectableWalletDetails,
  ConnectedWallet,
} from "../../package/src/blueprints";

export type WalletOpenMethod = "qrcode" | "universal-link" | "custom-deeplink";

export type WalletInfoWithOpenMethod =
  | JsInjectableWalletDetails
  | WalletInfoRemoteWithOpenMethod
  | (JsInjectableWalletDetails & WalletInfoRemoteWithOpenMethod);

export type WalletInfoRemoteWithOpenMethod = ConnectedWallet & {
  openMethod?: WalletOpenMethod;
};

export type Connected = WalletDetails & WalletInfoWithOpenMethod;
