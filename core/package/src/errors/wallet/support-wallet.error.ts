import { WithTonConnectionError } from "../../config/connect.error";

export class SupportError extends WithTonConnectionError {
  protected get info(): string {
    return "Wallet doen't support this connection!";
  }
  constructor(...args: ConstructorParameters<typeof WithTonConnectionError>) {
    super(...args);
    Object.setPrototypeOf(this, SupportError.prototype);
  }
}
