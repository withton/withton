import { DeviceInfo, TonProofItem } from '@withton/bridge';
import { TonAccount } from './account';

/**
 * Represents a connected wallet, including device information, account details, and connection items.
 */
export interface ConnectedWallet {
  /**
   * Information about the device on which the wallet is running.
   */
  device: DeviceInfo;

  /**
   * The type of provider used to connect the wallet.
   * - 'http': The wallet is connected via an HTTP bridge.
   * - 'injected': The wallet is injected directly into the application.
   */
  providerType: 'http' | 'injected';

  /**
   * The TON account associated with the connected wallet.
   */
  account: TonAccount;

  /**
   * Connection items provided by the wallet, including TON proof.
   */
  connectionItems: {
    /**
     * Proof of ownership for the connected TON account.
     */
    tonProof: TonProofItem;
  };
}
