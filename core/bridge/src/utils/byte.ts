export function mergeByteArrays(
  array1: Uint8Array,
  array2: Uint8Array,
): Uint8Array {
  const combinedArray = new Uint8Array(array1.length + array2.length);
  combinedArray.set(array1);
  combinedArray.set(array2, array1.length);
  return combinedArray;
}

export function divideByteArray(
  array: Uint8Array,
  splitIndex: number,
): [Uint8Array, Uint8Array] {
  if (splitIndex >= array.length) {
    throw new Error("Split index is out of bounds");
  }

  const firstPart = array.slice(0, splitIndex);
  const secondPart = array.slice(splitIndex);
  return [firstPart, secondPart];
}

export function convertToHex(byteArray: Uint8Array): string {
  return Array.from(byteArray)
    .map((byte) => ("0" + (byte & 0xff).toString(16)).slice(-2))
    .join("");
}

export function hexToBytes(hexString: string): Uint8Array {
  if (hexString.length % 2 !== 0) {
    throw new Error(`Invalid hex string: ${hexString}`);
  }
  const byteArray = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    byteArray[i / 2] = parseInt(hexString.slice(i, i + 2), 16);
  }
  return byteArray;
}
