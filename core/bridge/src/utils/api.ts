export function isNode(): boolean {
  try {
    return typeof process !== "undefined" && !!process.versions?.node;
  } catch {
    return false;
  }
}
