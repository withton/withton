import { KeyGen } from "@withton/bridge";
import { BridgeSession } from "./session";

/**
 * The BridgeRaw type extends the BridgeSession type, omitting the 'sessionCrypto' property
 * and adding the 'sessionKey' property of type 'KeyGen'.
 *
 * @property {KeyGen} sessionKey - Contains the key generation information for the session.
 */
export type BridgeRaw = Omit<BridgeSession, "sessionCrypto"> & {
  sessionKey: KeyGen;
};
