import { MemoryStorage } from "../storage/models/memory";
import { WithTonConnectionError } from "../errors";

export function getGlobalWindow(): Window | undefined {
  return typeof window !== "undefined" ? window : undefined;
}

/**
 * Tries to get the keys of the global window object.
 * Returns an empty array if the window object is not available or an error occurs.
 * This is useful in server-side environments or when accessing properties might fail due to security restrictions.
 */
export function getGlobalWindowKeys(): string[] {
  const globalWindow = getGlobalWindow();

  // Return an empty array if window object is not available (e.g., in SSR)
  if (!globalWindow) {
    return [];
  }

  try {
    // Try to get the keys of the window object
    return Object.keys(globalWindow);
  } catch (error) {
    // Optionally log the error for debugging purposes
    // console.error("Failed to retrieve window keys:", error);

    // Return an empty array if an error occurs
    return [];
  }
}

/**
 * Returns the global document object if available, otherwise undefined.
 * This function is useful for environments where the document object may not exist,
 * such as server-side rendering (SSR).
 */
export function getGlobalDocument(): Document | undefined {
  // Check if the document object is available (i.e., running in a browser environment)
  return typeof document !== "undefined" ? document : undefined;
}

/**
 * Constructs and returns the URL for the metadata.json file based on the current window location.
 * If the window or location object is unavailable (e.g., in SSR), returns an empty string.
 */
export function getMetaData(): string {
  const origin = getGlobalWindow()?.location?.origin;

  // Return metadata URL if origin is available
  if (origin) {
    return `${origin}/metadata.json`;
  }

  // Return empty string if origin is not available
  return "";
}

/**
 * Retrieves the localStorage object if available, otherwise returns a fallback.
 * In Node.js environments, it throws an error since localStorage is not available.
 * For non-Node.js environments where localStorage is unavailable, a MemoryStorage instance is used as a fallback.
 *
 * @returns {Storage} localStorage or MemoryStorage.
 * @throws {WithTonConnectionError} If in Node.js and localStorage is required.
 */
export function getLocalStorage(): Storage {
  if (canAccessLocalStorage()) {
    return localStorage;
  }

  if (isRunningInNodeJs()) {
    throw new WithTonConnectionError(
      "`localStorage` is required but is not available in the current Node.js environment for WithTon.",
    );
  }

  // Return a fallback MemoryStorage instance if not in Node.js
  return MemoryStorage.getInstance();
}

/**
 * Determines if localStorage is both available and functional in the current environment.
 * This function checks for access to localStorage and handles cases where access might fail,
 * such as in Safari's private browsing mode or when localStorage is disabled.
 *
 * @returns {boolean} True if localStorage is available and functional, otherwise false.
 */
export function canAccessLocalStorage(): boolean {
  try {
    const storageAvailable = typeof localStorage !== "undefined";

    // Try to use localStorage to ensure it's fully functional
    if (storageAvailable) {
      localStorage.setItem("test", "test");
      localStorage.removeItem("test");
    }

    return storageAvailable;
  } catch (error) {
    // Optionally, log the error for debugging purposes
    // console.error("localStorage is not available or functional:", error);
    return false;
  }
}

/**
 * Determines if the current environment is Node.js.
 * This checks for the presence of the `process` object and specific Node.js version properties.
 *
 * @returns {boolean} True if the environment is Node.js, otherwise false.
 */
export function isRunningInNodeJs(): boolean {
  return (
    typeof process !== "undefined" &&
    typeof process.versions === "object" &&
    typeof process.versions.node === "string"
  );
}
