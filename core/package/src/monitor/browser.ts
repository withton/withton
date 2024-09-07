import { getGlobalWindow } from "../helpers/api";
import {
  EventDispatcher,
  RemoveWithTonPrefix,
  AddWithTonPrefix,
} from "./dispatcher";

export class Browser<T extends { type: string }> implements EventDispatcher<T> {
  private readonly window: Window | undefined = getGlobalWindow();

  /**
   * Dispatches an event with the specified name and details.
   * @param prefixedEventName - The prefixed event name (e.g., `withton-`, `withton-kit-`).
   * @param eventDetails - The details of the event, with the prefix removed from `type`.
   */
  public async dispatchEvent<P extends AddWithTonPrefix<T["type"]>>(
    prefixedEventName: P,
    eventDetails: T & { type: RemoveWithTonPrefix<P> },
  ): Promise<void> {
    try {
      if (!this.window) {
        throw new Error("Global window object is not available.");
      }

      const event = new CustomEvent<T>(prefixedEventName, {
        detail: eventDetails,
      });
      this.window.dispatchEvent(event);
      console.log(`Event dispatched: ${prefixedEventName}`);
    } catch (error) {
      console.error("Error dispatching event:", error);
    }
  }

  /**
   * Adds an event listener for the specified event.
   * @param prefixedEventName - The prefixed event name (e.g., `withton-`, `withton-kit-`).
   * @param listener - The callback to execute when the event is triggered.
   * @param options - Optional listener options.
   * @returns A function to remove the event listener.
   */
  public async addEventListener<P extends AddWithTonPrefix<T["type"]>>(
    prefixedEventName: P,
    listener: (
      event: CustomEvent<T & { type: RemoveWithTonPrefix<P> }>,
    ) => void,
    options?: AddEventListenerOptions,
  ): Promise<() => void> {
    try {
      if (!this.window) {
        throw new Error("Global window object is not available.");
      }

      this.window.addEventListener(
        prefixedEventName,
        listener as EventListener | EventListenerObject,
        options,
      );
      console.log(`Listener added for: ${prefixedEventName}`);

      // Return a function to remove the listener
      return () => {
        this.window?.removeEventListener(
          prefixedEventName,
          listener as EventListener | EventListenerObject,
        );
        console.log(`Listener removed for: ${prefixedEventName}`);
      };
    } catch (error) {
      console.error("Error adding event listener:", error);
      return () => {};
    }
  }
}
