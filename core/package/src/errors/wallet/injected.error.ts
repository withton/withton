import { WithTonConnectionError } from "../../config/connect.error";

export class InjectedError extends WithTonConnectionError {
  protected get info(): string {
    return "Wallet injected error!";
  }
  constructor(...args: ConstructorParameters<typeof WithTonConnectionError>) {
    super(...args);

    Object.setPrototypeOf(this, InjectedError.prototype);
  }
}
