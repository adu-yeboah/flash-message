import type { FlashMessage, FlashMessageProviderProps } from "./types";

type Stacking = NonNullable<FlashMessageProviderProps["stacking"]>;

/** Pure: what the message list looks like after adding `msg`. */
export function addMessage(
  list: FlashMessage[],
  msg: FlashMessage,
  mode: Stacking,
  max: number
): FlashMessage[] {
  if (mode === "replace") return [msg];
  if (mode === "queue") return [...list, msg]; // everyone waits their turn
  return [...list, msg].slice(-max); // stack: the newest `max` win
}

/** Pure: the messages that are on screen right now. */
export function visibleMessages(list: FlashMessage[], max: number): FlashMessage[] {
  return list.slice(0, max);
}
