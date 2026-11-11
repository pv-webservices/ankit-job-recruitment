import { isIndianMobile } from "./registration.mjs";

export const recruiterServices = [
  "Manpower Recruitment",
  "Overseas Placement",
  "Staffing Services",
  "Corporate Training Services",
];
export const recruiterIndustries = [
  "Healthcare & Pharma",
  "Technology & Telecom",
  "Finance & Banking",
  "Manufacturing & Industrial",
  "Retail & E-commerce",
  "Construction & Infrastructure",
  "Airport & FMCG",
  "Warehouse & Logistics",
  "Other",
];
export const MAX_OPENINGS = 10000;
const MAX_TEXT = 100;
const MAX_DETAILS = 1000;

const requiredText = [
  ["companyName", "your company name"],
  ["contactPerson", "the contact person’s name"],
  ["designation", "the contact person’s designation"],
  ["jobRole", "the job role or position"],
  ["jobLocation", "the job location"],
];

export function validateRecruiter(data) {
  /** @type {Record<string, string>} */
  const errors = {};
  for (const [field, label] of requiredText) {
    const value = data[field]?.trim() ?? "";
    if (!value || value.length > MAX_TEXT)
      errors[field] = `Enter ${label} (up to ${MAX_TEXT} characters).`;
  }
  if (!isIndianMobile(data.mobile || ""))
    errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "") ||
    data.email.length > 254
  )
    errors.email = "Enter a valid business email address.";
  if (!recruiterIndustries.includes(data.industry))
    errors.industry = "Select your industry.";
  if (!recruiterServices.includes(data.service))
    errors.service = "Select the service you need.";
  const openings = String(data.openings ?? "").trim();
  if (!/^\d+$/.test(openings) || +openings < 1 || +openings > MAX_OPENINGS)
    errors.openings = `Enter the number of openings (1–${MAX_OPENINGS}).`;
  if ((data.details ?? "").length > MAX_DETAILS)
    errors.details = `Keep requirement details under ${MAX_DETAILS} characters.`;
  if (!data.consent)
    errors.consent = "Please read the privacy notice and select the consent checkbox.";
  return errors;
}
