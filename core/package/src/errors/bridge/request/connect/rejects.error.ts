import { WithTonConnectionError } from "../../../../config/connect.error";

export class RejectsError extends WithTonConnectionError {
  protected get info(): string {
    return "User Rjected the wallet action!";
  }
  constructor(...args: ConstructorParameters<typeof WithTonConnectionError>) {
    super(...args);

    Object.setPrototypeOf(this, RejectsError.prototype);
  }
}
