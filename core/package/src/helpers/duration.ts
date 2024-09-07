import { WithTonConnectionError } from "../errors";

export type abortableDurationOptions = {
  signal?: AbortSignal;
};

/**
 * Returns a promise that resolves after a given delay or rejects if the operation is aborted.
 *
 * @param {number} duration - The duration in milliseconds before the promise resolves.
 * @param {abortableDurationOptions} options - Optional AbortSignal to cancel the duration.
 * @returns {Promise<void>} - A promise that resolves after the delay or rejects if aborted.
 */
export async function abortableDuration(
  duration: number,
  options: abortableDurationOptions = {},
): Promise<void> {
  const { signal } = options;

  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      return reject(new WithTonConnectionError("Operation aborted"));
    }

    const timerId = setTimeout(() => {
      // Cleanup the event listener when the duration resolves successfully
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, duration);

    const handleAbort = () => {
      clearTimeout(timerId); // Clear the duration if the operation is aborted
      reject(new WithTonConnectionError("Operation aborted"));
    };

    if (signal) {
      signal.addEventListener("abort", handleAbort, { once: true });
    }
  });
}
