export const qualifications = [
  "Secondary",
  "Higher Secondary",
  "ITI",
  "Diploma",
  "Graduate",
  "Postgraduate",
  "Other",
];
export const genders = ["Male", "Female", "Other", "Prefer not to say"];

export function localISODate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function ageOnDate(value, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const birth = new Date(year, month - 1, day);
  if (
    birth.getFullYear() !== year ||
    birth.getMonth() !== month - 1 ||
    birth.getDate() !== day ||
    value > localISODate(today)
  )
    return null;
  let age = today.getFullYear() - year;
  if (
    today.getMonth() + 1 < month ||
    (today.getMonth() + 1 === month && today.getDate() < day)
  )
    age--;
  return age;
}

export function isIndianMobile(value) {
  if (!/^[+\d\s()-]+$/.test(value)) return false;
  return /^(?:\+?91)?[6-9]\d{9}$/.test(value.replace(/[\s()-]/g, ""));
}

export function validateCandidate(data, districts, today = new Date()) {
  /** @type {Record<string, string>} */
  const errors = {};
  for (const [field, label] of [
    ["name", "your name"],
    ["fatherName", "your father’s name"],
    ["motherName", "your mother’s name"],
  ]) {
    if (!data[field]?.trim() || data[field].trim().length > 100)
      errors[field] = `Enter ${label} (up to 100 characters).`;
  }
  if (!isIndianMobile(data.mobile || ""))
    errors.mobile = "Enter a valid 10-digit Indian mobile number.";
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "") ||
    data.email.length > 254
  )
    errors.email = "Enter a valid email address.";
  if (!qualifications.includes(data.qualification))
    errors.qualification = "Select your qualification.";
  if (ageOnDate(data.dob || "", today) === null)
    errors.dob = "Enter a valid date of birth that is not in the future.";
  if (!genders.includes(data.gender)) errors.gender = "Select a gender option.";
  if (!Object.hasOwn(districts, data.state || ""))
    errors.state = "Select your state or union territory.";
  if (
    !Object.hasOwn(districts, data.state || "") ||
    !districts[data.state].includes(data.district)
  )
    errors.district = "Select a district in your chosen state.";
  if (data.alternativeMobile?.trim() && !isIndianMobile(data.alternativeMobile))
    errors.alternativeMobile =
      "Enter a valid alternative mobile number, or leave it blank.";
  if (!data.consent)
    errors.consent =
      "Please read the privacy notice and select the consent checkbox.";
  return errors;
}
