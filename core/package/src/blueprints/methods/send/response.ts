export interface TransactionResponse {
  /**
   * Base64 encoded signed BOC (Bag of Cells).
   * This contains the signed transaction data that will be submitted to the blockchain.
   */
  signedTransaction: string;

  /**
   * The transaction ID, which can be used to track the transaction on the blockchain.
   */
  transactionId?: string;

  /**
   * The timestamp (in milliseconds) when the transaction was processed.
   */
  timestamp?: number;

  /**
   * The status of the transaction, such as 'pending', 'confirmed', or 'failed'.
   */
  status?: "pending" | "confirmed" | "failed";

  /**
   * Any message or additional data returned by the transaction processing system.
   */
  message?: string;
}
