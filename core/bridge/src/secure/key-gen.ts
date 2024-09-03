type CryptoKey = string;

export interface KeyGen {
  publicKey: CryptoKey;
  secretKey: CryptoKey;
}
