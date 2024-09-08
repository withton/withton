/**
 * Removes the `withton-` and `withton-kit-` prefixes from the given string.
 */
export type RemoveWithTonPrefix<T> = T extends `withton-kit-${infer Rest}`
  ? Rest
  : T extends `withton-${infer Rest}`
  ? Rest
  : T;

/**
 * Adds `withton-` and `withton-kit-` prefixes to the given string.
 */
export type AddWithTonPrefix<T extends string> =
  | `withton-${T}`
  | `withton-kit-${T}`;

/**
 * Interface for an event dispatcher that sends events with flexible `withton` prefix handling.
 */
export interface EventDispatcher<T extends { type: string }> {
  /**
   * Dispatches an event with the given name and details.
   * @param eventName - The name of the event to dispatch.
   * @param eventDetails - The details of the event to dispatch.
   */
  dispatchEvent<P extends AddWithTonPrefix<T["type"]>>(
    eventName: P,
    eventDetails: T & { type: RemoveWithTonPrefix<P> },
  ): Promise<void>;

  /**
   * Adds an event listener.
   * @param eventName - The name of the event to listen for.
   * @param listener - The listener to add.
   * @param options - The options for the listener.
   * @returns A function that removes the listener.
   */
  addEventListener<P extends AddWithTonPrefix<T["type"]>>(
    eventName: P,
    listener: (
      event: CustomEvent<T & { type: RemoveWithTonPrefix<P> }>,
    ) => void,
    options?: AddEventListenerOptions,
  ): Promise<() => void>;
}
