import { test } from "node:test";
import assert from "node:assert/strict";
import { parseAmount, isValidDate } from "../src/utils.js";

// parseAmount
test("parseAmount converts decimal string to integer paise", () => {
  assert.strictEqual(parseAmount("12.50"), 1250);
});

test("parseAmount rejects zero", () => {
  assert.strictEqual(parseAmount(0), null);
});

test("parseAmount rejects negative value", () => {
  assert.strictEqual(parseAmount(-10), null);
});

test("parseAmount rejects non-numeric string", () => {
  assert.strictEqual(parseAmount("abc"), null);
});

// isValidDate
test("isValidDate accepts a real calendar date", () => {
  assert.strictEqual(isValidDate("2025-06-15"), true);
});

test("isValidDate rejects an wrong date", () => {
  assert.strictEqual(isValidDate("2025-13-01"), false);
});
