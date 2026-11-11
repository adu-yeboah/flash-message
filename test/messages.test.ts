import { describe, it, expect } from "vitest";
import { addMessage, visibleMessages } from "../src/messages";
import type { FlashMessage } from "../src/index";

const msg = (id: string): FlashMessage => ({
  id,
  message: id,
  type: "info",
  duration: 3000,
});

describe("addMessage", () => {
  it("replace: keeps only the new message", () => {
    const list = addMessage([msg("a"), msg("b")], msg("c"), "replace", 5);
    expect(list.map((m) => m.id)).toEqual(["c"]);
  });

  it("queue: appends without limit — everyone waits their turn", () => {
    let list: FlashMessage[] = [];
    for (const id of ["a", "b", "c", "d", "e", "f"]) {
      list = addMessage(list, msg(id), "queue", 2);
    }
    expect(list.map((m) => m.id)).toEqual(["a", "b", "c", "d", "e", "f"]);
  });

  it("stack: keeps the newest max", () => {
    let list: FlashMessage[] = [];
    for (const id of ["a", "b", "c", "d"]) {
      list = addMessage(list, msg(id), "stack", 2);
    }
    expect(list.map((m) => m.id)).toEqual(["c", "d"]);
  });

  it("does not mutate the list it is given", () => {
    const list = [msg("a"), msg("b")];
    addMessage(list, msg("c"), "queue", 5);
    expect(list.map((m) => m.id)).toEqual(["a", "b"]);
  });
});

describe("visibleMessages", () => {
  it("shows the first max — the queue's head of the line", () => {
    const list = [msg("a"), msg("b"), msg("c")];
    expect(visibleMessages(list, 2).map((m) => m.id)).toEqual(["a", "b"]);
  });

  it("shows everything when the list is shorter than max", () => {
    const list = [msg("a")];
    expect(visibleMessages(list, 5)).toHaveLength(1);
  });
});
