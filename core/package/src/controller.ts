import { FetchError } from "./errors/manager/fetch.error";
import { WalletDetails, WalletInfoDTO, isCurrentEmbeddedWallet, CurrentInjectedWalletDetails, CurrentEmbeddedWalletDetails } from "./blueprints/wallet";
import { loggerError } from "./helpers/logger";
import { WALLETS } from "./config/wallets";
import { InjectedConnector } from './connector/injected/provider'

export class WalletsListController {
  private walletsListCache: Promise<WalletDetails[]> | null = null;

  private walletsListCacheCreationTime: number | null = null;

  private readonly cacheTTLMs: number | undefined;

  private readonly walletsListSource: string = 'https://raw.githubusercontent.com/ton-blockchain/wallets-list/main/wallets-v2.json';

  constructor(options?: { walletsListSource?: string; cacheTTLMs: number }) {
    if (options?.walletsListSource) {
      this.walletsListSource = options.walletsListSource;
    }

    if (options?.cacheTTLMs) {
      this.cacheTTLMs = options.cacheTTLMs;
    }
  }

  public async getWallets(): Promise<WalletDetails[]> {
    if (
      this.cacheTTLMs &&
      this.walletsListCacheCreationTime &&
      Date.now() > this.walletsListCacheCreationTime + this.cacheTTLMs
    ) {
      this.walletsListCache = null;
    }

    if (!this.walletsListCache) {
      this.walletsListCache = this.fetchWalletsList();
      this.walletsListCache
        .then(() => {
          this.walletsListCacheCreationTime = Date.now();
        })
        .catch(() => {
          this.walletsListCache = null;
          this.walletsListCacheCreationTime = null;
        });
    }

    return this.walletsListCache;
  }
  public async getEmbeddedWallet(): Promise<CurrentEmbeddedWalletDetails | null> {
    const walletsList = await this.getWallets();
    // @ts-ignore
    const embeddedWallets = walletsList.filter(isCurrentEmbeddedWallet);

    if (embeddedWallets.length !== 1) {
      return null;
    }

    return embeddedWallets[0]!;
  }

  private async fetchWalletsList(): Promise<WalletDetails[]> {
    let walletsList: WalletDetails[] = [];

    try {
      const walletsResponse = await fetch(this.walletsListSource);
      walletsList = await walletsResponse.json();

      if (!Array.isArray(walletsList)) {
        throw new FetchError(
          'Wrong wallets list format, wallets list must be an array.'
        );
      }

      const wrongFormatWallets = walletsList.filter(
        wallet => !this.isCorrectWalletConfigDTO(wallet)
      );
      if (wrongFormatWallets.length) {
        loggerError(
          `Wallet(s) ${wrongFormatWallets
            .map(wallet => wallet.name)
            .join(
              ', '
            )} config format is wrong. They were removed from the wallets list.`
        );

        walletsList = walletsList.filter(wallet => this.isCorrectWalletConfigDTO(wallet));
      }
    } catch (e) {
      loggerError(e);
      walletsList = WALLETS;
    }

    let currentlyInjectedWallets: CurrentInjectedWalletDetails[] = [];
    try {
      currentlyInjectedWallets = InjectedConnector.getCurrentInjectedWallets();
    } catch (e) {
      loggerError(e);
    }

    return this.mergeWalletsLists(
      // @ts-ignore
      this.walletConfigDTOListToWalletConfigList(walletsList),
      currentlyInjectedWallets
    );
  }

  private walletConfigDTOListToWalletConfigList(walletConfigDTO: WalletInfoDTO[]): WalletDetails[] {
    return walletConfigDTO.map(walletConfigDTO => {
      const walletConfigBase: any = {
        name: walletConfigDTO.name,
        appName: walletConfigDTO.appName,
        imageUrl: walletConfigDTO.iconUrl,
        aboutUrl: walletConfigDTO.aboutUrl,
        tondns: walletConfigDTO.tonDns,
        platforms: walletConfigDTO.platforms
      };

      const walletConfig: WalletDetails = walletConfigBase as WalletDetails;

      walletConfigDTO.bridge.forEach(bridge => {
        if (bridge.type === 'sse') {
          (walletConfig as any).bridgeUrl = bridge.url;
          (walletConfig as any).universalLink =
            walletConfigDTO.universalLink!;
          (walletConfig as any).deepLink = walletConfigDTO.deepLink;
        }

        if (bridge.type === 'js') {
          const jsBridgeKey = bridge.key;
          (walletConfig as any).jsBridgeKey = jsBridgeKey;
          (walletConfig as any).injected =
            InjectedConnector?.isWalletInjected(jsBridgeKey);
          (walletConfig as any).embedded =
            InjectedConnector?.isInsideWalletBrowser(jsBridgeKey);
        }
      });

      return walletConfig;
    });
  }


  private mergeWalletsLists(list1: WalletDetails[], list2: WalletDetails[]): WalletDetails[] {
    const names = new Set(list1.concat(list2).map(item => item.name));

    return [...names.values()].map(name => {
      const list1Item = list1.find(item => item.name === name);
      const list2Item = list2.find(item => item.name === name);

      return {
        ...(list1Item && { ...list1Item }),
        ...(list2Item && { ...list2Item })
      } as WalletDetails;
    });
  }

  private isCorrectWalletConfigDTO(value: unknown): value is WalletInfoDTO {
    if (!value || !(typeof value === 'object')) {
      return false;
    }

    const containsName = 'name' in value;
    const containsAppName = 'appName' in value;
    const containsImage = 'iconUrl' in value;
    const containsAbout = 'aboutUrl' in value;
    const containsPlatforms = 'platforms' in value;

    if (
      !containsName ||
      !containsImage ||
      !containsAbout ||
      !containsPlatforms ||
      !containsAppName
    ) {
      return false;
    }

    if (
      !(value as { platforms: unknown }).platforms ||
      !Array.isArray((value as { platforms: unknown }).platforms) ||
      !(value as { platforms: string[] }).platforms.length
    ) {
      return false;
    }
    if (
      !('bridge' in value) ||
      !Array.isArray((value as { bridge: unknown }).bridge) ||
      !(value as { bridge: unknown[] }).bridge.length
    ) {
      return false;
    }

    const bridge = (value as { bridge: unknown[] }).bridge;

    if (bridge.some(item => !item || typeof item !== 'object' || !('type' in item))) {
      return false;
    }

    const sseBridge = bridge.find(item => (item as { type: string }).type === 'sse');

    if (sseBridge) {
      if (
        // @ts-ignore
        !('url' in sseBridge) ||
        !(sseBridge as { url: string }).url ||
        !(value as unknown as { universalLink: string }).universalLink
      ) {
        return false;
      }
    }

    const jsBridge = bridge.find(item => (item as { type: string }).type === 'js');

    if (jsBridge) {
      //@ts-ignore
      if (!('key' in jsBridge) || !(jsBridge as { key: string }).key) {
        return false;
      }
    }

    return true;
  }
}
