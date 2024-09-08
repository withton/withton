import { KitError } from "../error";

// Error factory function that creates a WalletNotFoundError
export function createWalletNotFoundError(
  message = "Wallet not found",
): KitError {
  // Create an instance of KitError with the message
  const error = new KitError(message);

  // Customize the error properties
  error.name = "WalletNotFoundError";

  // Add any custom properties if needed
  (error as any).customCode = 404; // Example: custom error code

  // Capture the stack trace for better debugging
  if (Error.captureStackTrace) {
    Error.captureStackTrace(error, createWalletNotFoundError);
  }

  return error;
}
