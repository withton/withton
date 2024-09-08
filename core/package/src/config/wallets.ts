import { WalletInfoDTO } from "../blueprints/wallet";

export const WALLETS: WalletInfoDTO[] = [
  {
    appName: "tg-wallet",
    name: "Wallet",
    iconUrl: "https://wallet.tg/images/logo-288.png",
    aboutUrl: "https://wallet.ts",
    universalLink: "https://t.me/wallet?attach=wallet",
    bridge: [
      {
        type: "sse",
        url: "wss://websocket.wallet.tg/bridge",
      },
    ],
    platforms: ["ios", "android", "macos", "windows", "linux"],
  },
  {
    appName: "mytonwallet",
    name: "My Ton Wallet",
    iconUrl: "https://static.mytonwallet.io/icon-256.png",
    aboutUrl: "https://mytonwallet.io",
    universalLink: "https://connect.mytonwallet.org",
    bridge: [
      {
        type: "js",
        key: "mytonwallet",
      },
    ],
    platforms: [
      "chrome",
      "windows",
      "macos",
      "linux",
      "ios",
      "android",
      "firefox",
    ],
  },
  {
    appName: "tonwallet",
    name: "Ton Wallet",
    iconUrl: "https://wallet.ton.org/assets/ui/qr-logo.png",
    aboutUrl:
      "https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd",
    bridge: [
      {
        type: "js",
        key: "tonwallet",
      },
    ],
    platforms: ["chrome"],
  },
];
