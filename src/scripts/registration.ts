import districts from "../data/india-districts.json";
import {
  ageOnDate,
  localISODate,
  validateCandidate,
} from "../lib/registration.mjs";
import { validateUpload } from "../lib/upload.mjs";
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
        updateDate();
      }
      validating = false;
    });
    submit.disabled = false;
  });
