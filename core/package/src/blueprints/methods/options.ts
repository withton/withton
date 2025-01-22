import {StorageType} from '../../storage/models/types';
import {EventDispatcher} from '../../monitor/dispatcher'
import {PackageAction} from '../../monitor/types'


export interface WithTonOptions {
  manifestUrl?: string;

  storage?: StorageType;

  eventDispatcher?: EventDispatcher<PackageAction>;

  walletsListSource?: string;

  walletListCache?: number;

  disableAutoPauseConnection?: boolean;
}
