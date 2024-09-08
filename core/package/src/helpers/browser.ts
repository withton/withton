import { MemoryStorage } from "../storage/models/memory";
import { WithTonConnectionError } from "../errors";

/**
 * Retrieves the global `window` object, if available.
 *
 * @returns {Window | undefined} - Returns the `window` object or `undefined` if unavailable.
 */
export function getGlobalWindow(): Window | undefined {
  return typeof window !== "undefined" ? window : undefined;
}

/**
 * Safely retrieves the keys of the `window` object.
 *
 * @returns {string[]} - Returns an array of keys from the `window` object, or an empty array if inaccessible.
 */
export function getWindowKeysSafely(): string[] {
  const globalWindow = getGlobalWindow();

  if (!globalWindow) {
    return [];
  }

  try {
    return Object.keys(globalWindow);
  } catch {
    return [];
  }
}

/**
 * Retrieves the global `document` object, if available.
 *
 * @returns {Document | undefined} - Returns the `document` object or `undefined` if unavailable.
 */
export function getGlobalDocument(): Document | undefined {
  return typeof document !== "undefined" ? document : undefined;
}

/**
 * Constructs the full path to the web page manifest based on the origin of the current location.
 *
 * @returns {string} - Returns the full URL to the manifest file, or an empty string if the `window` object is unavailable.
 */
export function getWebManifestUrl(): string {
  const origin = getGlobalWindow()?.location.origin;

  return origin ? `${origin}/metadata.json` : "";
}

/**
 * Attempts to return the `localStorage` object. If `localStorage` is unavailable, such as in Safari's private mode,
 * it returns `MemoryStorage`. In a Node.js environment, throws an error since `localStorage` is required.
 *
 * @returns {Storage} - The `localStorage` object or an in-memory storage fallback.
 * @throws {WithTonConnectionError} - If in Node.js environment where `localStorage` is unavailable.
 */
export function getSafeLocalStorage(): Storage {
  if (isLocalStorageAvailable()) {
    return localStorage;
  }

  if (isNodeEnvironment()) {
    throw new WithTonConnectionError("`localStorage` is required for WithTon.");
  }

  return MemoryStorage.getInstance();
}

/**
 * Checks whether `localStorage` is accessible in the current environment.
 *
 * @returns {boolean} - Returns `true` if `localStorage` is available, otherwise `false`.
 */
function isLocalStorageAvailable(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

/**
 * Determines whether the current runtime environment is Node.js.
 *
 * @returns {boolean} - Returns `true` if running in a Node.js environment, otherwise `false`.
 */
function isNodeEnvironment(): boolean {
  return (
    typeof process !== "undefined" &&
    process.versions != null &&
    process.versions.node != null
  );
}
