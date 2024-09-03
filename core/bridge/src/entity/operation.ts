export type Operation =
  | SendTransactionOperationDeprecated
  | SendTransactionOperation
  | SignDataOperation;

export type SendTransactionOperationDeprecated = "SendTransaction";

export interface SendTransactionOperation {
  name: "SendTransaction";
  maxMessages: number;
}

export interface SignDataOperation {
  name: "SignData";
}
