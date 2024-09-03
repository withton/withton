export type ConnectItem = TonAddressItem | TonProofItem;

export interface TonAddressItem {
    name: 'ton_address';
}

export interface TonProofItem {
    name: 'ton_proof';
    payload: string;
}
