import { WithTonConnectionError } from "../../config/connect.error";

export class BinaryError extends WithTonConnectionError {
  protected get info(): string {
    return "Binary is incorrect format";
  }
  constructor(...args: ConstructorParameters<typeof WithTonConnectionError>) {
    super(...args);
    Object.setPrototypeOf(this, BinaryError.prototype);
  }
}
