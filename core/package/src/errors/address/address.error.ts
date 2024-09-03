import { WithTonConnectionError } from "../../config/connect.error";

export class AddressError extends WithTonConnectionError {
  protected get additionalInfo(): string {
    return "Address processing error occurred.";
  }

  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    Object.setPrototypeOf(this, AddressError.prototype);
  }
}
