import { abortableDuration } from "./duration";
import { WithTonConnectionError } from "../errors";
import { createAbortManager } from "./abortManager";

export type OnSuccessOpts = {
  signal?: AbortSignal;
  attempts?: number;
  timeoutInMilliseconds?: number;
};
export async function onSuccess<
  T extends (options: { signal?: AbortSignal }) => Promise<any>,
>(fn: T, opts: OnSuccessOpts = {}): Promise<Awaited<ReturnType<T>>> {
  const { signal, attempts = 10, timeoutInMilliseconds = 200 } = opts;
  const abortManager = createAbortManager(signal);

  let attemptCount: number = 0;
  let lastError: unknown;

  while (attemptCount < attempts) {
    if (abortManager?.signal?.aborted) {
      throw new WithTonConnectionError(
        `Execution aborted after ${attemptCount} attempts.`,
      );
    }

    try {
      return await fn({ signal: abortManager?.signal });
    } catch (error: any) {
      lastError = error;
      attemptCount++;

      if (attemptCount < attempts) {
        await abortableDuration(timeoutInMilliseconds);
      }
    }
  }

  throw new WithTonConnectionError(
    `Operation failed after ${attempts} attempts. Last encountered error: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}
