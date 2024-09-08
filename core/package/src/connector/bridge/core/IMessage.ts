/**
 * Represents a message in the Bridge system.
 *
 * @property {string} from - The sender of the message, typically a Address.
 * @property {string} message - The content of the message.
 */
export type BridgeIMessage = {
  from: string; // Sender's identifier (e.g., address)
  message: string; // The content of the message
};
