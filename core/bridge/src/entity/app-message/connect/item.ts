export type ConnectItem = TonAddressItem | WalletSignaturefItem;

export interface TonAddressItem {
    name: 'ton_address';
}

export interface WalletSignaturefItem {
    name: 'ton_proof';
    payload: string;
}
