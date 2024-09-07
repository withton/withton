import { AddressError, FetchError } from "../errors";
import { Base64 } from "@withton/bridge";

export enum TransactionTags {
  NoBounceable = 0x51,
  TestOnly = 0x80,
}

/**
 * Transforms a hexadecimal TON address into a human-readable, base64-encoded form.
 *
 * @param rawAddress - The raw TON address formatted as "0:<hex string>".
 * @param testMode - Optional flag to format the address for testnet use (default: false).
 * @returns The user-friendly base64-encoded address.
 */
export function convertAddress(rawAddress: string, testMode: boolean = false): string {
    const { chainId, addressBytes } = splitRawAddress(rawAddress);

    // Start with the base tag for no-bounceable transactions
    let tag = TransactionTags.NoBounceable;

    // If it's test mode, add the test-only flag
    if (testMode) {
        tag |= TransactionTags.TestOnly;
    }

    // Create a 34-byte array: first byte for tag, second for chainId, remaining 32 bytes for the address
    const formattedAddress = new Int8Array(34);
    formattedAddress[0] = tag;
    formattedAddress[1] = chainId;
    formattedAddress.set(addressBytes, 2);

    // Add a CRC16 checksum to the address, resulting in a 36-byte array
    const finalAddress = appendChecksum(formattedAddress);

    // Convert to URL-safe Base64 encoding
    return makeBase64Safe(Base64.encode(finalAddress));
}

/**
 * Splits a raw hexadecimal address into its chain ID and address byte array.
 *
 * @param address - The raw hexadecimal address in the format "0:<hex string>".
 * @returns An object containing the chainId and address byte array.
 * @throws {AddressError} if the address format is invalid.
 */
function splitRawAddress(address: string): { chainId: 0 | -1; addressBytes: Uint8Array } {
    const parts = address.split(':');

    if (parts.length !== 2) {
        throw new AddressError(`Invalid address format: ${address}. It should be in the format "0:<hex string>".`);
    }

    const chainId = parseInt(parts[0], 10) as 0 | -1;

    if (chainId !== 0 && chainId !== -1) {
        throw new AddressError(`Invalid chain ID: ${chainId}. Expected 0 or -1.`);
    }

    const hexPart = parts[1];

    if (hexPart.length !== 64) {
        throw new AddressError(`Hexadecimal part of the address must be 64 characters long. Received ${hexPart.length}.`);
    }

    return {
        chainId,
        addressBytes: hexToByteArray(hexPart)
    };
}

/**
 * Appends a CRC16 checksum to the provided byte array.
 *
 * @param data - The original data to which the checksum will be appended.
 * @returns A new Uint8Array containing the original data and a 2-byte checksum.
 */
function appendChecksum(data: Int8Array): Uint8Array {
    const checksum = computeCrc16(data);
    const result = new Uint8Array(data.length + 2); // Original data + 2 bytes for the checksum
    result.set(data);
    result.set(checksum, data.length);
    return result;
}

/**
 * Computes a CRC16 checksum for the given data array.
 *
 * @param data - The data for which to compute the checksum.
 * @returns A 2-byte Uint8Array containing the checksum.
 */
function computeCrc16(data: ArrayLike<number>): Uint8Array {
    const polynomial = 0x1021;
    let register = 0;

    const extendedData = new Uint8Array(data.length + 2); // Padding 2 extra bytes for CRC
    extendedData.set(data);

    for (const byte of extendedData) {
        let mask = 0x80;
        while (mask > 0) {
            register <<= 1;
            if (byte & mask) {
                register++;
            }
            mask >>= 1;
            if (register > 0xffff) {
                register &= 0xffff;
                register ^= polynomial;
            }
        }
    }

    return new Uint8Array([Math.floor(register / 256), register % 256]);
}

/**
 * Converts a hexadecimal string into a Uint8Array of bytes.
 *
 * @param hexString - The hexadecimal string to convert.
 * @returns A Uint8Array representing the byte values of the hex string.
 * @throws {FetchError} if the hex string is invalid.
 */
function hexToByteArray(hexString: string): Uint8Array {
    const length = hexString.length;
    if (length % 2 !== 0) {
        throw new FetchError(`Invalid hex string length: ${hexString}. Length must be a multiple of 2.`);
    }

    const byteArray = new Uint8Array(length / 2);
    for (let i = 0; i < length; i += 2) {
        const hexPair = hexString.substring(i, i + 2);
        const byte = parseInt(hexPair, 16);
        if (isNaN(byte)) {
            throw new FetchError(`Invalid hex character: ${hexPair}`);
        }
        byteArray[i / 2] = byte;
    }

    return byteArray;
}

/**
 * Makes a base64 string URL-safe by replacing '+' with '-', and '/' with '_'.
 *
 * @param base64String - The original base64 string.
 * @returns The URL-safe base64 string.
 */
function makeBase64Safe(base64String: string): string {
    return base64String.replace(/\+/g, '-').replace(/\//g, '_');
}
