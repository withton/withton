import { WithTonConnectionError } from "../errors";
import { createAbortManager } from "./abortManager";

/**
 * Configuration options for the async operation.
 */
export type AsyncOptions = {
  timeoutDuration?: number;
  externalSignal?: AbortSignal;
};

/**
 * Represents an asynchronous task that can be deferred.
 */
export type DeferredTask<T> = (
  onSuccess: (value: T) => void,
  onError: (reason?: any) => void,
  config: AsyncOptions,
) => Promise<void>;

/**
 * Executes an asynchronous task with optional timeout and abort handling.
 * If a timeout is provided, the task will be aborted if it takes too long.
 * If an external abort signal is provided, the task can be aborted externally.
 *
 * @param task - The asynchronous task to execute.
 * @param config - Optional configuration for timeout and abort signal.
 * @returns A promise that resolves with the task result or rejects if aborted or timed out.
 */
export function executeWithTimeout<T>(
  task: DeferredTask<T>,
  config?: AsyncOptions,
): Promise<T> {
  const timeoutDuration = config?.timeoutDuration;
  const externalSignal = config?.externalSignal;

  const abortController = createAbortManager(externalSignal);

  return new Promise(async (resolve, reject) => {
    if (abortController.signal.aborted) {
      reject(new WithTonConnectionError("Operation aborted"));
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (typeof timeoutDuration !== "undefined") {
      timeoutId = setTimeout(() => {
        abortController.abort();
        reject(
          new WithTonConnectionError(
            `Timeout reached after ${timeoutDuration}ms`,
          ),
        );
      }, timeoutDuration);
    }

    abortController.signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timeoutId);
        reject(new WithTonConnectionError("Operation aborted"));
      },
      { once: true },
    );

    const taskOptions = { timeoutDuration, signal: abortController.signal };

    // Execute the provided async task
    try {
      await task(
        (result) => {
          clearTimeout(timeoutId);
          resolve(result);
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        taskOptions,
      );
    } catch (error) {
      reject(error);
    }
  });
}
