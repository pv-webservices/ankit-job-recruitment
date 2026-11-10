import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const districts = JSON.parse(
  await readFile(
    new URL("../src/data/india-districts.json", import.meta.url),
    "utf8",
  ),
);
test("LGD snapshot covers all states/UTs and districts are unique within each state", () => {
  assert.equal(Object.keys(districts).length, 36);
  assert.equal(Object.values(districts).flat().length, 784);
  for (const names of Object.values(districts)) {
    assert.ok(names.length);
    assert.equal(new Set(names).size, names.length);
  }
  assert.ok(districts["West Bengal"].includes("Kolkata"));
  assert.ok(districts["Andhra Pradesh"].includes("Visakhapatnam"));
  assert.ok(districts.Odisha.includes("Khordha"));
  assert.ok(districts["Dadra And Nagar Haveli And Daman And Diu"]);
});
