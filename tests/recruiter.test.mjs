import { test } from "node:test";
import assert from "node:assert/strict";
import { validateRecruiter } from "../src/lib/recruiter.mjs";

const valid = {
  companyName: "Acme Industries",
  contactPerson: "Priya Sharma",
  designation: "HR Manager",
  mobile: "+91 98765 43210",
  email: "hr@acme.example",
  industry: "Manufacturing & Industrial",
  service: "Staffing Services",
  jobRole: "Machine Operator",
  openings: "25",
  jobLocation: "Bhubaneswar, Odisha",
  details: "",
  consent: true,
};

test("accepts a complete recruiter requirement", () => {
  assert.deepEqual(validateRecruiter(valid), {});
});

test("rejects missing, whitespace-only and over-long required text", () => {
  const errors = validateRecruiter({ ...valid, companyName: "   ", jobRole: "x".repeat(101) });
  assert.ok(errors.companyName);
  assert.ok(errors.jobRole);
});

test("rejects invalid contact details, enums and consent", () => {
  const errors = validateRecruiter({ ...valid, mobile: "12345", email: "nope", industry: "Mining", service: "", consent: false });
  assert.deepEqual(Object.keys(errors).sort(), ["consent", "email", "industry", "mobile", "service"]);
});

test("openings must be a whole number between 1 and 10000", () => {
  for (const openings of ["0", "-3", "2.5", "abc", "", "10001"])
    assert.ok(validateRecruiter({ ...valid, openings }).openings, openings);
  for (const openings of ["1", "10000"])
    assert.equal(validateRecruiter({ ...valid, openings }).openings, undefined);
});

test("optional details are limited to 1000 characters", () => {
  assert.ok(validateRecruiter({ ...valid, details: "a".repeat(1001) }).details);
  assert.equal(validateRecruiter({ ...valid, details: "a".repeat(1000) }).details, undefined);
});
