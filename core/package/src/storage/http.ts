import { StorageType } from "./models/types";
import { WithTonConnectionError } from "../errors";
export class HttpBridgeStorage {
  private readonly storeKey: string;

  constructor(
    private readonly storage: StorageType,
    bridgeLink: string,
  ) {
    this.storeKey = `withton-http-data-${bridgeLink}`;
  }

  // Store the lastEventId in storage
  public async storeLastEventId(lastEventId: string): Promise<void> {
    try {
      await this.storage.set(this.storeKey, lastEventId);
    } catch (error: any) {
      throw new WithTonConnectionError(
        `Failed to store lastEventId: ${error.message}`,
      );
    }
  }

  // Remove the lastEventId from storage
  public async removeLastEventId(): Promise<void> {
    try {
      await this.storage.remove(this.storeKey);
    } catch (error: any) {
      throw new WithTonConnectionError(
        `Failed to remove lastEventId: ${error.message}`,
      );
    }
  }

  // Retrieve the lastEventId from storage
  public async getLastEventId(): Promise<string | null> {
    try {
      const storedLastEventId = await this.storage.get(this.storeKey);

      // Return null if nothing is stored
      return storedLastEventId ?? null;
    } catch (error: any) {
      throw new WithTonConnectionError(
        `Failed to retrieve lastEventId: ${error.message}`,
      );
    }
  }
}
