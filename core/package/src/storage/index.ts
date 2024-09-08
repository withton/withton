import { getLocalStorage } from "../helpers/api";
import { StorageType } from "./models/types";

export class LocalStorageWrapper implements StorageType {
  private storage: Storage;

  constructor() {
    this.storage = getLocalStorage();
  }

  public async get(key: string): Promise<string | null> {
    return this.storage.getItem(key);
  }

  public async set(key: string, value: string): Promise<void> {
    this.storage.setItem(key, value);
  }

  public async remove(key: string): Promise<void> {
    this.storage.removeItem(key);
  }
}
