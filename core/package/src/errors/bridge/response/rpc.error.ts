import { WithTonConnectionError } from "../../../config/connect.error";

export class RpcError extends WithTonConnectionError {
  protected get info(): string {
    return "Error with send RPC Request to the injected wallet!";
  }
  constructor(...args: ConstructorParameters<typeof WithTonConnectionError>) {
    super(...args);
    Object.setPrototypeOf(this, RpcError.prototype);
  }
}
