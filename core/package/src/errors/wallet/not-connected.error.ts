import { WithTonConnectionError } from "../../config/connect.error";

export class NotConnctedError extends WithTonConnectionError {
  protected get info(): string {
    return "Wallet not Connected!";
  }
  constructor(...args: ConstructorParameters<typeof WithTonConnectionError>) {
    super(...args);
    Object.setPrototypeOf(this, NotConnctedError.prototype);
  }
}
