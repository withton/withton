import { WithTonConnectionError } from "../../../../config/connect.error";

export class MetaDataError extends WithTonConnectionError {
  protected get info(): string {
    return "The provided `metadata.json | .txt` contains errors. Please check the format of your metadata. For more details, visit https://example.com/metadata.json or  https://example.com/metadata.txt";
  }

  constructor(...args: ConstructorParameters<typeof WithTonConnectionError>) {
    super(...args);

    Object.setPrototypeOf(this, MetaDataError.prototype);
  }
}
