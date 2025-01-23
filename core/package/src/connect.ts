import { WalletDetails } from "./blueprints";
import { InjectedConnector } from "./connector/injected/provider";
import { WalletsListController } from "./controller";
import { IWithTon } from "./withton.interface";
import {WithTonMonitor} from './monitor'
import {WithTonOptions} from './blueprints/methods/options'

export class WithTon implements IWithTon {
  private static readonly wallets = new WalletsListController()

  public static isWalletInjacted = (walletJSKey: string): boolean => InjectedConnector.isWalletInjected(walletJSKey)

  public static isInsideWalletBrowser = (walletJSKey: string): boolean => InjectedConnector.isInsideWalletBrowser(walletJSKey)

  public static getWallets(): Promise<WalletDetails[]> {
    return this.wallets.getWallets()
  }

  private readonly tracker: WithTonMonitor;

  private readonly walletList= new WalletsListController();

  private readonly dappSettings: Pick<Required<WithTonOptions>,"manifestUrl"| "storage">;

  private readonly bridgeConnectionStorage:
}
