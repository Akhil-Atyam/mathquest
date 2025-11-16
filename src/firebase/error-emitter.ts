'use client';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Defines the shape of all possible events and their corresponding payload types.
 * This centralizes event definitions for type safety across the application.
 * Currently, it only handles Firestore permission errors.
 */
export interface AppEvents {
  'permission-error': FirestorePermissionError;
}

// A generic type for a callback function (a listener).
type Callback<T> = (data: T) => void;

/**
 * A factory function that creates a strongly-typed, lightweight event emitter (Pub/Sub pattern).
 * It uses a generic type `T` that extends a record of event names to payload types.
 * This ensures that when you emit an event, the payload matches the type expected by the listeners.
 *
 * @returns An object with `on`, `off`, and `emit` methods.
 */
function createEventEmitter<T extends Record<string, any>>() {
  // `events` is a dictionary where keys are event names and values are arrays of listener callbacks.
  const events: { [K in keyof T]?: Array<Callback<T[K]>> } = {};

  return {
    /**
     * Subscribes a listener to an event.
     * @param {K} eventName - The name of the event to subscribe to.
     * @param {Callback<T[K]>} callback - The function to call when the event is emitted.
     */
    on<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        events[eventName] = [];
      }
      events[eventName]?.push(callback);
    },

    /**
     * Unsubscribes a listener from an event.
     * @param {K} eventName - The name of the event to unsubscribe from.
     * @param {Callback<T[K]>} callback - The specific callback function to remove.
     */
    off<K extends keyof T>(eventName: K, callback: Callback<T[K]>) {
      if (!events[eventName]) {
        return;
      }
      events[eventName] = events[eventName]?.filter(cb => cb !== callback);
    },

    /**
     * Publishes an event to all subscribed listeners.
     * @param {K} eventName - The name of the event to emit.
     * @param {T[K]} data - The data payload that corresponds to the event's type.
     */
    emit<K extends keyof T>(eventName: K, data: T[K]) {
      if (!events[eventName]) {
        return;
      }
      events[eventName]?.forEach(callback => callback(data));
    },
  };
}

/**
 * A singleton instance of the event emitter, specifically typed with our `AppEvents`.
 * This is exported and used throughout the app to globally communicate errors.
 * For example, a Firestore utility can `emit('permission-error', ...)` and the
 * `FirebaseErrorListener` component can `.on('permission-error', ...)` to catch it.
 */
export const errorEmitter = createEventEmitter<AppEvents>();
