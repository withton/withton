import { WithTonConnectionError } from "../../config/connect.error";

export class FetchError extends WithTonConnectionError {
  protected get info(): string {
    return "Error with fetching wallets!, sorry!";
  }
  constructor(...args: ConstructorParameters<typeof WithTonConnectionError>) {
    super(...args);

    Object.setPrototypeOf(this, FetchError.prototype);
  }
}
