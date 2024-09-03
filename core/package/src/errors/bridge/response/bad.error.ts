import { WithTonConnectionError } from "../../../config/connect.error";

export class BadRequestError extends WithTonConnectionError {
  protected get info(): string {
    return "Issue with the call Request to the wallets!";
  }
  constructor(...args: ConstructorParameters<typeof WithTonConnectionError>) {
    super(...args);

    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
