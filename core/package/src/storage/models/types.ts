/**
 * Defines the storage interface for managing key-value pairs asynchronously.
 * It supports setting, getting, and removing items from the storage.
 */
export interface StorageType {
  /**
   * Asynchronously sets a value in the storage for a given key.
   * @param key - The key under which the value is stored.
   * @param value - The value to store.
   * @returns A promise that resolves when the operation is complete.
   */
  set(key: string, value: string): Promise<void>;

  /**
   * Asynchronously retrieves the value associated with a given key.
   * @param key - The key for the value to retrieve.
   * @returns A promise that resolves with the value, or null if the key does not exist.
   */
  get(key: string): Promise<string | null>;

  /**
   * Asynchronously removes the value associated with a given key.
   * @param key - The key of the value to remove.
   * @returns A promise that resolves when the operation is complete.
   */
  remove(key: string): Promise<void>;
}
