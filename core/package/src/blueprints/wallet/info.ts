/**
 * Common information shared by all wallets, both injectable and HTTP-compatible.
 */
export interface WalletDetails {
  /**
   * The human-readable name of the wallet.
   */
  name: string;

  /**
   * A unique identifier for the wallet, equivalent to the `appName` property in {@link Wallet.device}.
   */
  appName: string;

  /**
   * URL to the wallet's icon. Recommended resolution: 288×288px, non-transparent background, without rounded corners. PNG format.
   */
  iconUrl: string;

  /**
   * TON DNS address for future protocol use.
   */
  tonDns?: string;

  /**
   * URL to the wallet's informational or landing page, useful for newcomers to TON.
   */
  aboutUrl: string;

  /**
   * Platforms on which the wallet is available (e.g., iOS, Android, MacOS).
   */
  platforms: (
    | "ios"
    | "android"
    | "macos"
    | "windows"
    | "linux"
    | "chrome"
    | "firefox"
    | "safari"
  )[];
}

/**
 * Details specific to HTTP-compatible wallets.
 */
export interface HttpWalletDetails extends WalletDetails {
  /**
   * Base URL for the wallet's universal link, supporting
   */
  universalLink: string;

  /**
   * Native deep link for the wallet app, supporting
   */
  deepLink?: string;

  /**
   * URL for the wallet's HTTP bridge implementation, as described in the
   */
  bridgeUrl: string;
}

/**
 * Details specific to JS-injectable wallets.
 */
export interface JsInjectableWalletDetails extends WalletDetails {
  /**
   * The key for accessing the JS Bridge object through `window`. For example, if the key is "tonkeeper",
   * the bridge can be accessed as `window.tonkeeper`.
   */
  jsBridgeKey: string;

  /**
   * Indicates whether the wallet is currently injected into the webpage.
   */
  injected: boolean;

  /**
   * Indicates whether the dApp is running inside the wallet's browser.
   */
  embedded: boolean;
}

/**
 * Details about the JS-injectable wallet currently injected into the webpage.
 */
export interface CurrentInjectedWalletDetails
  extends JsInjectableWalletDetails {
  injected: true;
}

/**
 * Details about the JS-injectable wallet where the dApp is currently embedded.
 */
export interface CurrentEmbeddedWalletDetails
  extends CurrentInjectedWalletDetails {
  embedded: true;
}

/**
 * @deprecated Use `JsInjectableWalletDetails` or `CurrentInjectedWalletDetails` instead.
 */
export interface DeprecatedInjectedWalletDetails extends WalletDetails {
  jsBridgeKey: string;
  injected: boolean;
  embedded: boolean;
}

/**
 * Union type representing different wallet details.
 */
export type WalletDetailsUnion =
  | HttpWalletDetails
  | JsInjectableWalletDetails
  | (HttpWalletDetails & JsInjectableWalletDetails);

/**
 * Data transfer object (DTO) for wallet information.
 */
export interface WalletInfoDTO {
  name: string;
  appName: string;
  iconUrl: string;
  tonDns?: string;
  aboutUrl: string;
  universalLink?: string;
  platforms: (
    | "ios"
    | "android"
    | "macos"
    | "windows"
    | "linux"
    | "chrome"
    | "firefox"
    | "safari"
  )[];

  deepLink?: string;
  bridge: (HttpBridgeDTO | JsBridgeDTO)[];
}

/**
 * DTO for HTTP bridge details.
 */
export interface HttpBridgeDTO {
  type: "sse";
  url: string;
}

/**
 * DTO for JS bridge details.
 */
export interface JsBridgeDTO {
  type: "js";
  key: string;
}

/**
 * Type guard to check if `WalletDetailsUnion` is `CurrentInjectedWalletDetails`.
 *
 * @param value The wallet details to check.
 * @returns `true` if the wallet is currently injected, otherwise `false`.
 */
export function isCurrentInjectedWallet(
  value: WalletDetailsUnion,
): value is CurrentInjectedWalletDetails {
  return isJsInjectableWallet(value) && value.injected;
}

/**
 * Type guard to check if `WalletDetailsUnion` is `CurrentEmbeddedWalletDetails`.
 *
 * @param value The wallet details to check.
 * @returns `true` if the wallet is currently embedded, otherwise `false`.
 */
export function isCurrentEmbeddedWallet(
  value: WalletDetailsUnion,
): value is CurrentEmbeddedWalletDetails {
  return isCurrentInjectedWallet(value) && value.embedded;
}

/**
 * Type guard to check if `WalletDetailsUnion` is `JsInjectableWalletDetails`.
 *
 * @param value The wallet details to check.
 * @returns `true` if the wallet is JS-injectable, otherwise `false`.
 */
export function isJsInjectableWallet(
  value: WalletDetailsUnion,
): value is JsInjectableWalletDetails {
  return "jsBridgeKey" in value;
}

/**
 * Type guard to check if `WalletDetailsUnion` is `HttpWalletDetails`.
 *
 * @param value The wallet details to check.
 * @returns `true` if the wallet is HTTP-compatible, otherwise `false`.
 */
export function isHttpWallet(
  value: WalletDetailsUnion,
): value is HttpWalletDetails {
  return "bridgeUrl" in value;
}

/**
 * @deprecated Use `isJsInjectableWallet` or `isCurrentInjectedWallet` instead.
 * @param value The wallet details to check.
 * @returns `true` if the wallet is injected, otherwise `false`.
 */
export function isDeprecatedInjectedWallet(
  value: WalletDetailsUnion,
): value is DeprecatedInjectedWalletDetails {
  return "jsBridgeKey" in value;
}
