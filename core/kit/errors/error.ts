import { WithTonConnectionError } from "../../package/src/errors";

// Helper function to create a KitError, extending WithTonConnectionError
export function createKitError(message: string): WithTonConnectionError {
  // Create an instance of WithTonConnectionError with the message
  const error = new WithTonConnectionError(message);

  // Assign additional properties to the error object
  Object.assign(error, {
    name: "KitError",
    customMessage: `KitError: ${message}`,
    customCode: 500, // Add any additional custom property you need
  });

  // Optionally capture the stack trace for debugging in Node.js
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, createKitError);
  }

  return error;
}

// KitError class extends WithTonConnectionError and uses the factory function
export class KitError extends WithTonConnectionError {
  constructor(message: string) {
    // Call the parent class (WithTonConnectionError) constructor
    super(message);

    // Ensure the correct prototype chain
    Object.setPrototypeOf(this, KitError.prototype);

    // Set the error name
    this.name = "KitError";

    // Optionally capture the stack trace for better debugging
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, KitError);
    }
  }

  // Static method to throw an instance of KitError
  static throw(message: string): never {
    throw new KitError(message); // Throw a new KitError
  }
}
