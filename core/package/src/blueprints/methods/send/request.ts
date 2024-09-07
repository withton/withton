import { CHAIN } from "@withton/bridge";

/**
 * Represents the payload for sending a request with customized parameter names.
 */
export interface TransactionRequest {
  /**
   * Expiration timestamp (in milliseconds) until the request is valid.
   */
  expiresAt: number;
  /**
   * The blockchain network on which the transaction is occurring.
   */
  network?: CHAIN;
  /**
   * The wallet address or identifier of the sender.
   */
  sender?: string;
  /**
   * An array of recipients and transaction details.
   */
  transaction?: {
    /**
     * The recipient's address.
     */
    address: string;
    /**
     * The token amount to send as a string.
     */
    amount?: string;
    /**
     * Initialization string for smart contracts or advanced transactions.
     */
    initState?: string;
    /**
     * Additional data related to the transaction, like metadata.
     */
    data?: string;
  }[];
}
