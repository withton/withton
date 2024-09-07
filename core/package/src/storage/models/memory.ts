/**
 * A simple in-memory key-value storage system, functioning like localStorage
 * but without persistence. It can be used as a fallback in environments like
 * Safari's private mode where localStorage may not be available.
 */
export class MemoryStorage implements Storage {
  // Singleton instance to ensure only one instance of MemoryStorage exists
  private static instance: MemoryStorage;

  // Internal storage object to hold key-value pairs in memory
  private storage: Map<string, string> = new Map();

  // Private constructor to prevent direct instantiation
  private constructor() {}

  /**
   * Returns the singleton instance of MemoryStorage.
   * @returns The instance of MemoryStorage.
   */
  public static getInstance(): MemoryStorage {
    if (!MemoryStorage.instance) {
      MemoryStorage.instance = new MemoryStorage();
    }
    return MemoryStorage.instance;
  }

  /**
   * Retrieves the number of stored key-value pairs.
   * @returns The number of items in storage.
   */
  public get length(): number {
    return this.storage.size;
  }

  /**
   * Clears all key-value pairs from the storage.
   */
  public clear(): void {
    this.storage.clear();
  }

  /**
   * Retrieves the value associated with the specified key.
   * @param key - The key of the item to retrieve.
   * @returns The value associated with the key, or null if the key does not exist.
   */
  public getItem(key: string): string | null {
    return this.storage.get(key) ?? null;
  }

  /**
   * Retrieves the key at the specified index in the storage.
   * @param index - The index of the key to retrieve.
   * @returns The key at the specified index, or null if the index is out of range.
   */
  public key(index: number): string | null {
    const keys = Array.from(this.storage.keys());
    return keys[index] ?? null;
  }

  /**
   * Removes the item associated with the specified key from the storage.
   * @param key - The key of the item to remove.
   */
  public removeItem(key: string): void {
    this.storage.delete(key);
  }

  /**
   * Adds or updates the value for the specified key in the storage.
   * @param key - The key to set or update.
   * @param value - The value to associate with the key.
   */
  public setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }
}
