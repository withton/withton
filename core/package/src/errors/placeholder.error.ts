import { WithTonConnectionError } from "./index";

export class PlaceholderError extends WithTonConnectionError {
  constructor(...args: ConstructorParameters<typeof WithTonConnectionError>) {
    super(...args);
    Object.setPrototypeOf(this, PlaceholderError.prototype)
  }
}
