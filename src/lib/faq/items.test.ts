import { describe, expect, it } from "vitest";
import { FAQ_ITEM_KEYS } from "./items";

describe("FAQ_ITEM_KEYS", () => {
  it("exposes seven Q&A pairs shared by home and /faq", () => {
    expect(FAQ_ITEM_KEYS).toHaveLength(7);
    for (const [q, a] of FAQ_ITEM_KEYS) {
      expect(q).toMatch(/^faq\.q\d$/);
      expect(a).toMatch(/^faq\.a\d$/);
      expect(q.slice(-1)).toBe(a.slice(-1));
    }
  });
});
