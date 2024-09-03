import { WithTonConnectionError } from "../../../../config/connect.error";

export class NoMetaDataError extends WithTonConnectionError {
  protected get info(): string {
    return "MetaData not exist!  Please check the format of your metadata. For more details, visit https://example.com/metadata.json or  https://example.com/metadata.txt";
  }
  constructor(...args: ConstructorParameters<typeof WithTonConnectionError>) {
    super(...args);

    Object.setPrototypeOf(this, NoMetaDataError.prototype);
  }
}
