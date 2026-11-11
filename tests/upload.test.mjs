import { test } from "node:test";
import assert from "node:assert/strict";
import { validateUpload, MAX_UPLOAD_BYTES } from "../src/lib/upload.mjs";

test("no file is allowed because uploads are optional", () => {
  assert.equal(validateUpload(null), "");
  assert.equal(validateUpload({ size: 0, type: "" }), "");
});

test("accepts PDF, Word and images up to 5 MB", () => {
  for (const type of ["application/pdf", "application/msword", "image/png", "image/jpeg",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"])
    assert.equal(validateUpload({ size: MAX_UPLOAD_BYTES, type }), "", type);
});

test("rejects other types and files over 5 MB", () => {
  assert.match(validateUpload({ size: 100, type: "application/x-msdownload" }), /PDF/);
  assert.match(validateUpload({ size: MAX_UPLOAD_BYTES + 1, type: "application/pdf" }), /5 MB/);
});
