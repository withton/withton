import { SendTransactionOperation, Operation } from "@withton/bridge";
import { loggerWarning } from "../helpers/logger";
import { SupportError } from "../errors/wallet/support-wallet.error";

interface TransactionOptions {
  requiredMessagesNumber: number;
}

export function validateTransactionSupport(
  operations: Operation[],
  options: TransactionOptions,
): never | void {
  const supportsLegacySendTransaction = operations.includes("SendTransaction");

  const sendTransactionOperation = operations.find(
    (op) => op && typeof op === "object" && op.name === "SendTransaction",
  ) as SendTransactionOperation;

  if (!supportsLegacySendTransaction && !sendTransactionOperation) {
    throw new SupportError(
      "This wallet does not support the SendTransaction feature. Please use a wallet that supports this feature to proceed.",
    );
  }

  if (
    sendTransactionOperation &&
    sendTransactionOperation.maxMessages !== undefined
  ) {
    if (sendTransactionOperation.maxMessages < options.requiredMessagesNumber) {
      throw new SupportError(
        `The wallet can handle up to ${sendTransactionOperation.maxMessages} messages in a SendTransaction request, but ${options.requiredMessagesNumber} messages are required. Please adjust your request or use a wallet that supports more messages.`,
      );
    }
    return;
  }

  loggerWarning(
    "The wallet did not provide information about the maximum number of messages allowed in a SendTransaction request. Your request might be rejected by the wallet.",
  );
}
