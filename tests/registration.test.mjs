import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ageOnDate,
  localISODate,
  isIndianMobile,
  validateCandidate,
} from "../src/lib/registration.mjs";

test("age follows the local calendar birthday, including leap days", () => {
  const today = new Date(2026, 10, 10, 0, 5);
  assert.equal(localISODate(today), "2026-11-10");
  assert.equal(ageOnDate("2000-11-10", today), 26);
  assert.equal(ageOnDate("2000-11-11", today), 25);
  assert.equal(ageOnDate("2004-02-29", new Date(2026, 1, 28)), 21);
  assert.equal(ageOnDate("2004-02-29", new Date(2026, 2, 1)), 22);
  assert.equal(ageOnDate("2026-11-11", today), null);
  assert.equal(ageOnDate("2001-02-29", today), null);
  assert.equal(ageOnDate("nonsense", today), null);
});

test("Indian mobile validation accepts formatted national and +91 numbers", () => {
  for (const value of ["8348623389", "+91 83486 23389", "918348623389"])
    assert.equal(isIndianMobile(value), true);
  for (const value of [
    "1234567890",
    "834862338",
    "+1 8348623389",
    "8348623389abc",
  ])
    assert.equal(isIndianMobile(value), false);
});

test("validation rejects whitespace, future DOB, invalid contacts and mismatched districts", () => {
  const districts = { "West Bengal": ["Kolkata"], Odisha: ["Khordha"] };
  const candidate = {
    name: "Sample Candidate",
    fatherName: "Sample Father",
    motherName: "Sample Mother",
    mobile: "8348623389",
    email: "sample@example.com",
    qualification: "Graduate",
    dob: "2000-11-10",
    gender: "Prefer not to say",
    state: "West Bengal",
    district: "Kolkata",
    alternativeMobile: "",
    consent: true,
  };
  assert.deepEqual(
    validateCandidate(candidate, districts, new Date(2026, 10, 10)),
    {},
  );
  const errors = validateCandidate(
    {
      ...candidate,
      name: "   ",
      dob: "2027-01-01",
      mobile: "123",
      email: "bad",
      district: "Khordha",
      alternativeMobile: "invalid",
      consent: false,
    },
    districts,
    new Date(2026, 10, 10),
  );
  for (const field of [
    "name",
    "dob",
    "mobile",
    "email",
    "district",
    "alternativeMobile",
    "consent",
  ])
    assert.ok(errors[field], field);
  assert.ok(
    validateCandidate(
      { ...candidate, qualification: "invented", gender: "invented" },
      districts,
    ).qualification,
  );
});
