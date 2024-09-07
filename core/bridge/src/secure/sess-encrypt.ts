import { KeyGen } from "./key-gen";
import { mergeByteArrays, divideByteArray, convertToHex } from "../utils";

export class SessionCrypto {
  private readonly nonceLength = 12; // 12 bytes for AES-GCM nonce

  private keyGen!: KeyGen;
  public readonly sessionId: string;

  constructor(keyGen?: KeyGen) {
    if (keyGen) {
      this.keyGen = this.createKeyGenFromString(keyGen);
      this.sessionId = convertToHex(Buffer.from(this.keyGen.publicKey, "hex"));
    } else {
      throw new Error("Initialization required");
    }
  }

  public async initialize(keyGen?: KeyGen): Promise<void> {
    if (!keyGen) {
      this.keyGen = await this.generateKeyGen();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).sessionId = convertToHex(
        Buffer.from(this.keyGen.publicKey, "hex"),
      );
    }
  }

  private async generateKeyGen(): Promise<KeyGen> {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      ["deriveKey"],
    );

    const publicKey = await window.crypto.subtle.exportKey(
      "raw",
      keyPair.publicKey,
    );
    const privateKey = await window.crypto.subtle.exportKey(
      "pkcs8",
      keyPair.privateKey,
    );

    return {
      publicKey: Buffer.from(publicKey).toString("hex"),
      secretKey: Buffer.from(privateKey).toString("hex"),
    };
  }

  private createKeyGenFromString(keyGen: KeyGen): KeyGen {
    return {
      publicKey: keyGen.publicKey,
      secretKey: keyGen.secretKey,
    };
  }

  private async generateNonce(): Promise<Uint8Array> {
    return window.crypto.getRandomValues(new Uint8Array(this.nonceLength));
  }

  public async encrypt(
    message: string,
    receiverPublicKey: string,
  ): Promise<Uint8Array> {
    const sharedKey = await this.deriveSharedKey(receiverPublicKey);
    const nonce = await this.generateNonce();

    const encryptedMessage = new Uint8Array(
      await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: nonce,
        },
        sharedKey,
        new TextEncoder().encode(message),
      ),
    );

    return mergeByteArrays(nonce, encryptedMessage);
  }

  public async decrypt(
    message: Uint8Array,
    senderPublicKey: string,
  ): Promise<string> {
    const [nonce, encryptedMessage] = divideByteArray(
      message,
      this.nonceLength,
    );

    const sharedKey = await this.deriveSharedKey(senderPublicKey);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: nonce,
      },
      sharedKey,
      encryptedMessage,
    );

    return new TextDecoder().decode(decrypted);
  }

  private async deriveSharedKey(receiverPublicKey: string): Promise<CryptoKey> {
    const publicKey = await window.crypto.subtle.importKey(
      "raw",
      Buffer.from(receiverPublicKey, "hex"),
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      [],
    );

    const privateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      Buffer.from(this.keyGen.secretKey, "hex"),
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      ["deriveKey"],
    );

    return window.crypto.subtle.deriveKey(
      {
        name: "ECDH",
        public: publicKey,
      },
      privateKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"],
    );
  }

  public stringifyKeyGen(): KeyGen {
    return {
      publicKey: this.keyGen.publicKey,
      secretKey: this.keyGen.secretKey,
    };
  }
}
