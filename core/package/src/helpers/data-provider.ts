import { WithTonConnectionError } from "../errors";
import { abortableDuration } from "./duration";
import { createAbortManager } from "./abortManager";

export type ResourceHandler<Resource, Params extends unknown[]> = {
  initialize: (
    abortSignal?: AbortSignal,
    ...params: Params
  ) => Promise<Resource>;
  getActiveResource: () => Resource | null;
  cleanup: () => Promise<void>;
  reinitialize: (duration: number) => Promise<Resource>;
};

/**
 * Manages the lifecycle of a resource, including its initialization, cleanup, and reinitialization.
 * The `Resource` is any object that requires controlled creation and disposal, while `Params` represents
 * the arguments needed to initialize the resource.
 */
export function manageResource<Resource, Params extends unknown[]>(
  initFn: (signal?: AbortSignal, ...params: Params) => Promise<Resource>, // Function to initialize the resource
  cleanupFn: (resource: Resource) => Promise<void>, // Function to cleanup the resource
): ResourceHandler<Resource, Params> {
  // Internal State
  let activeResource: Resource | null = null; // Currently active resource
  let savedParams: Params | null = null; // Parameters used for initialization
  let pendingPromise: Promise<Resource> | null = null; // Promise tracking the current initialization process
  let abortController: AbortController | null = null; // Controller to manage abortion of asynchronous operations

  /**
   * Initialize a new resource.
   * This function creates a resource, aborts any previous initialization process, and saves the newly created resource.
   *
   * @param signal - Optional AbortSignal to handle request cancellation.
   * @param params - The parameters needed for resource initialization.
   * @returns A promise resolving with the newly created resource.
   */
  const initialize = async (
    signal?: AbortSignal,
    ...params: Params
  ): Promise<Resource> => {
    try {
      abortController?.abort();
      abortController = createAbortManager(signal);

      if (abortController.signal.aborted) {
        throw new WithTonConnectionError("Resource initialization was aborted");
      }

      savedParams = params;

      const resourcePromise = initFn(abortController.signal, ...params);
      pendingPromise = resourcePromise;

      // Await resource initialization
      const resource = await resourcePromise;

      if (pendingPromise !== resourcePromise) {
        await cleanupFn(resource);
        throw new WithTonConnectionError(
          "Resource initialization aborted due to a new request",
        );
      }

      activeResource = resource;
      return activeResource;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Retrieve the currently active resource.
   *
   * @returns The active resource or `null` if no resource is active.
   */
  const getActiveResource = (): Resource | null => activeResource;

  /**
   * Cleanup the active resource and pending operations.
   * This function aborts ongoing resource initialization and disposes of the active resource.
   *
   * @returns A promise that resolves once the cleanup is complete.
   */
  const cleanup = async (): Promise<void> => {
    try {
      abortController?.abort();

      const resource = activeResource;
      activeResource = null;

      const promise = pendingPromise;
      pendingPromise = null;

      // Cleanup both the resource and any in-progress promises
      await Promise.allSettled([
        resource ? cleanupFn(resource) : Promise.resolve(),
        promise ? cleanupFn(await promise) : Promise.resolve(),
      ]);
    } catch (error) {
      console.error(error);
    }
  };

  /**
   * Reinitialize the resource after a delay.
   * This function waits for a specified delay before attempting to reinitialize the resource.
   * It ensures that the resource is only reinitialized if no changes to the state have occurred during the delay.
   *
   * @param duration - The amount of time (in milliseconds) to wait before reinitializing.
   * @returns A promise that resolves with the reinitialized resource.
   */
  const reinitialize = async (duration: number): Promise<Resource> => {
    try {
      const resource = activeResource; // Capture the current active resource
      const promise = pendingPromise; // Capture the current pending promise
      const params = savedParams; // Capture the current saved parameters

      // Wait for the specified delay
      await abortableDuration(duration);

      // Only reinitialize if the state hasn't changed during the delay
      if (
        resource === activeResource &&
        promise === pendingPromise &&
        params === savedParams
      ) {
        // Reinitialize the resource with the saved parameters
        return await initialize(
          abortController?.signal,
          ...(params ?? ([] as unknown as Params)),
        );
      }

      throw new WithTonConnectionError(
        "Reinitialization was aborted due to a new request",
      );
    } catch (error) {
      throw error;
    }
  };

  return {
    initialize,
    getActiveResource,
    cleanup,
    reinitialize,
  };
}
