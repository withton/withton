import { ConnectItem } from './item';

export interface ConnectionRequest {
    configUrl: string;
    details: ConnectItem[];
}
