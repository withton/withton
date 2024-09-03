import { WithTonConnectionError } from "../../config/connect.error";

export class ConnectedError extends WithTonConnectionError {
  protected get info(): string {
    return "Wallet already connected!";
  }
  constructor(...args: ConstructorParameters<typeof WithTonConnectionError>) {
    super(...args);
    Object.setPrototypeOf(this, ConnectedError.prototype);
  }
}
