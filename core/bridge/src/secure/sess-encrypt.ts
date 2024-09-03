import { KeyGen } from "./key-gen";
import { mergeByteArrays, divideByteArray, convertToHex } from "../utils";
import {
  createECDH,
  randomBytes,
  createCipheriv,
  createDecipheriv,
} from "crypto";

export class SessionCrypto {
  private readonly nonceLength = 16; // 16 bytes for AES-GCM nonce

  private readonly keyGen: KeyGen;

  public readonly sessionId: string;

  constructor(keyGen?: KeyGen) {
    this.keyGen = keyGen
      ? this.createKeyGenFromString(keyGen)
      : this.generateKeyGen();
    this.sessionId = convertToHex(Buffer.from(this.keyGen.publicKey, "hex"));
  }

  private generateKeyGen(): KeyGen {
    const ecdh = createECDH("secp256k1");
    ecdh.generateKeys();
    return {
      publicKey: ecdh.getPublicKey("hex"),
      secretKey: ecdh.getPrivateKey("hex"),
    };
  }

  private createKeyGenFromString(keyGen: KeyGen): KeyGen {
    return {
      publicKey: keyGen.publicKey,
      secretKey: keyGen.secretKey,
    };
  }

  private generateNonce(): Uint8Array {
    return randomBytes(this.nonceLength);
  }

  public encrypt(message: string, receiverPublicKey: string): Uint8Array {
    const sharedKey = this.deriveSharedKey(receiverPublicKey);
    const nonce = this.generateNonce();
    const cipher = createCipheriv("aes-256-gcm", sharedKey, nonce);

    const encryptedMessage = Buffer.concat([
      cipher.update(message, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    return mergeByteArrays(nonce, mergeByteArrays(encryptedMessage, authTag));
  }

  public decrypt(message: Uint8Array, senderPublicKey: string): string {
    const [nonce, encryptedMessageWithAuthTag] = divideByteArray(
      message,
      this.nonceLength,
    );
    const [encryptedMessage, authTag] = divideByteArray(
      encryptedMessageWithAuthTag,
      encryptedMessageWithAuthTag.length - 16,
    );

    const sharedKey = this.deriveSharedKey(senderPublicKey);
    const decipher = createDecipheriv("aes-256-gcm", sharedKey, nonce);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encryptedMessage),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }

  private deriveSharedKey(receiverPublicKey: string): Buffer {
    const ecdh = createECDH("secp256k1");
    ecdh.setPrivateKey(Buffer.from(this.keyGen.secretKey, "hex"));
    return ecdh.computeSecret(Buffer.from(receiverPublicKey, "hex"));
  }

  public stringifyKeypair(): KeyGen {
    return {
      publicKey: this.keyGen.publicKey,
      secretKey: this.keyGen.secretKey,
    };
  }
}
