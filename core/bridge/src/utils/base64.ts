import { Base64 as Base64Util } from "js-base64";

function encodeUint8Array(value: Uint8Array, urlSafe: boolean): string {
  let encoded = Base64Util.fromUint8Array(value);
  if (urlSafe) {
    encoded = encoded
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  return encoded;
}

function decodeToUint8Array(value: string, urlSafe: boolean): Uint8Array {
  if (urlSafe) {
    value = value.replace(/-/g, "+").replace(/_/g, "/");
    while (value.length % 4) {
      value += "=";
    }
  }
  return Base64Util.toUint8Array(value);
}

function encode(value: string | object | Uint8Array, urlSafe = false): string {
  let uint8Array: Uint8Array;

  if (value instanceof Uint8Array) {
    uint8Array = value;
  } else {
    if (typeof value !== "string") {
      value = JSON.stringify(value);
    }

    uint8Array = new TextEncoder().encode(value);
  }

  return encodeUint8Array(uint8Array, urlSafe);
}

function decode(
  value: string,
  urlSafe = false,
): {
  toString(): string;
  toObject<T>(): T | null;
  toUint8Array(): Uint8Array;
} {
  const decodedUint8Array = decodeToUint8Array(value, urlSafe);

  return {
    toString(): string {
      return new TextDecoder().decode(decodedUint8Array);
    },
    toObject<T>(): T | null {
      try {
        return JSON.parse(new TextDecoder().decode(decodedUint8Array)) as T;
      } catch (e) {
        console.log(e);
        return null;
      }
    },
    toUint8Array(): Uint8Array {
      return decodedUint8Array;
    },
  };
}

export const Base64 = {
  encode,
  decode,
};

export type { encode, decode };
