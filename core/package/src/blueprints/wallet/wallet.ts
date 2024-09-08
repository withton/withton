<<<<<<< HEAD
import { DeviceInfo, TonProofItem } from '@withton/bridge';
=======
import { DeviceInfo, WalletSignaturefItem } from '@withton/bridge';
>>>>>>> e236bfc9aead2a460c2f1142674eba9d72979507
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
<<<<<<< HEAD
    tonProof: TonProofItem;
=======
    walletSignature: WalletSignaturefItem;
>>>>>>> e236bfc9aead2a460c2f1142674eba9d72979507
  };
}
