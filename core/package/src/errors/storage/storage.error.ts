import { WithTonConnectionError } from "../../config/connect.error";

export class StorageError extends WithTonConnectionError {
  protected get info(): string {
    return "Error woth localStorage";
  }
  constructor(...args: ConstructorParameters<typeof WithTonConnectionError>) {
    super(...args);
    Object.setPrototypeOf(this, StorageError.prototype);
  }
}
