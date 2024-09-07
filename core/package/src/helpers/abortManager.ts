export function createAbortManager(signal?: AbortSignal): AbortController {
  const abortManager = new AbortController();

  if (signal?.aborted) {
    abortManager.abort();
  } else if (signal) {
    signal.addEventListener("abort", () => abortManager.abort(), {
      once: true,
    });
  }

  return abortManager;
}

/**
 * Utility function to manually abort an AbortController and clean up resources.
 *
 * @param {AbortController} abortManager - The AbortController instance to abort and clean up.
 */
export function abortControllerCleanup(abortManager: AbortController): void {
  if (!abortManager.signal.aborted) {
    abortManager.abort();
  }
}
