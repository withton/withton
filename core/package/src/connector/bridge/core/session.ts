import { SessionCrypto } from "@withton/bridge";



// BridgeSession interface
export interface BridgeSession {
  sessionCrypto: SessionCrypto;
  publicKey: string;
  bridgeLink: string;
}

export type BridgeSessionType = Omit<BridgeSession, "publicKey">;
