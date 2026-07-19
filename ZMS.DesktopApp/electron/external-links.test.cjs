const assert = require("node:assert/strict");
const test = require("node:test");
const { isSafeExternalUrl } = require("./external-links.cjs");

test("allows explicit HTTPS documentation links", () => {
  assert.equal(isSafeExternalUrl("https://learn.microsoft.com/sharepoint"), true);
});

test("blocks scripts, local files, and malformed targets", () => {
  assert.equal(isSafeExternalUrl("javascript:alert(1)"), false);
  assert.equal(isSafeExternalUrl("file:///C:/private.txt"), false);
  assert.equal(isSafeExternalUrl("not a url"), false);
});
