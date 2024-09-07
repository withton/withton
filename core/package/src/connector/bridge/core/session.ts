import { SessionCrypto } from "@withton/bridge";

// Branded type for PublicKey
type PublicKey = string & { __brand: "PublicKey" };

// URL type for BridgeLink that must start with http:// or https://
type BridgeLink = `http://${string}` | `https://${string}`;

// BridgeSession interface
export interface BridgeSession {
  sessionCrypto: SessionCrypto;
  publicKey: PublicKey;
  bridgeLink: BridgeLink;
}

export type BridgeSessionType = Omit<BridgeSession, "publicKey">;
