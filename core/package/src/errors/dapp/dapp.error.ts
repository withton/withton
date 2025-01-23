import {WithTonConnectionError} from '../../config/connect.error'


export class DappError extends WithTonConnectionError {
  protected get info(): string{
    return  'Dapp Metadata is not correct'
  }
  constructor(...args: ConstructorParameters<typeof WithTonConnectionError>) {
    super(...args);
    Object.setPrototypeOf(this, DappError.prototype)
  }
}
