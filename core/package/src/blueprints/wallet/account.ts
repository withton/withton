import { CHAIN } from "@withton/bridge";

/**
 * Represents a Ton account.
 */
export interface TonAccount {
  /**
   * The unique address of the account on the blockchain.
   */
  address: string;

  /**
   * The blockchain network the account is associated with (e.g., Ethereum, TON).
   */
  network: CHAIN;

  /**
   * The initial state or data used to initialize the account.
   */
  stateInit: string;

  /**
   * The public key associated with the account.
   */
  publicKey: string;
}
