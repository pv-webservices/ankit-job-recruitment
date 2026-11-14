import districts from "../data/india-districts.json";
import {
  ageOnDate,
  localISODate,
  validateCandidate,
} from "../lib/registration.mjs";
import { validateUpload } from "../lib/upload.mjs";
import { isIndia } from "../lib/countries.mjs";
import { jobs } from "../data/jobs";
import { attachFileLabels, newSubmissionId, runSubmission } from "./submit";
const districtMap: Record<string, string[]> = districts;
document
  .querySelectorAll<HTMLFormElement>("[data-candidate-form]")
  .forEach((form) => {
    const field = (name: string) =>
      form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement;
    const dob = field("dob") as HTMLInputElement;
    const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
    const status = form.querySelector<HTMLElement>(".form-status")!;
    let attempted = false;
    let validating = false;
    const state = { submissionId: newSubmissionId() };
    attachFileLabels(form);
    function updateDate() {
      dob.max = localISODate();
      field("age").value = String(ageOnDate(dob.value) ?? "");
    }
    updateDate();
    window.addEventListener("focus", updateDate);
    dob.addEventListener("input", updateDate);
    field("state").addEventListener("change", () => {
      const district = field("district") as HTMLSelectElement;
      district.replaceChildren(new Option("Select district", ""));
      for (const name of districtMap[field("state").value] || [])
        district.add(new Option(name, name));
      district.disabled = !field("state").value;
    });
    // India uses the State / District dropdowns; other countries type a city.
    const mobile = field("mobile") as HTMLInputElement;
    const indianPlaceholder = mobile.placeholder;
    function setFieldVisible(name: string, visible: boolean) {
      const control = field(name);
      control.closest<HTMLElement>(".form-field")!.hidden = !visible;
      control.disabled = !visible;
    }
    function updateCountry() {
      const inIndia = isIndia(field("country").value);
      setFieldVisible("state", inIndia);
      setFieldVisible("district", inIndia);
      if (inIndia) field("district").disabled = !field("state").value;
      setFieldVisible("city", !inIndia);
      mobile.placeholder = inIndia ? indianPlaceholder : "Mobile with country code, e.g. +971…";
    }
    field("country").addEventListener("change", updateCountry);
    updateCountry();

    // "Apply Now" links pass ?job=<slug> so the opening is pre-selected.
    const jobSlug = new URLSearchParams(location.search).get("job");
    const job = jobs.find((j) => j.slug === jobSlug);
    if (job) field("appliedFor").value = job.title;

    function validate() {
      updateDate();
      const data = Object.fromEntries(new FormData(form));
      const errors: Record<string, string> = validateCandidate(
        { ...data, consent: (field("consent") as HTMLInputElement).checked },
        districtMap,
      );
      const resume = (field("resume") as HTMLInputElement).files?.[0];
      const uploadError = validateUpload(resume);
      if (uploadError) errors.resume = uploadError;
      for (const el of Array.from(form.elements)) {
        if (!(
          el instanceof HTMLInputElement || el instanceof HTMLSelectElement
        ))
          continue;
        const error = form.querySelector<HTMLElement>(`#${el.id}-error`);
        if (error) error.textContent = errors[el.name] || "";
        el.setAttribute("aria-invalid", String(Boolean(errors[el.name])));
      }
      return errors;
    }
    form.addEventListener("input", () => {
      if (attempted) {
        validate();
        status.textContent = "";
      }
    });
    form.addEventListener("change", () => {
      if (attempted) validate();
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (validating) return;
      validating = true;
      attempted = true;
      const errors = validate();
      if (Object.keys(errors).length) {
        status.className = "form-status is-error";
        status.textContent = "Please check the highlighted fields.";
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      } else if (await runSubmission(form, "candidate", "resume", state)) {
        attempted = false;
        const district = field("district") as HTMLSelectElement;
        district.replaceChildren(new Option("Select state first", ""));
        district.disabled = true;
        updateCountry();
        updateDate();
      }
      validating = false;
    });
    submit.disabled = false;
  });
