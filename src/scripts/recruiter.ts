import { validateRecruiter } from "../lib/recruiter.mjs";
import { validateUpload } from "../lib/upload.mjs";
import { attachFileLabels, newSubmissionId, runSubmission } from "./submit";

type Control = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
const isControl = (el: Element): el is Control =>
  el instanceof HTMLInputElement ||
  el instanceof HTMLSelectElement ||
  el instanceof HTMLTextAreaElement;

document
  .querySelectorAll<HTMLFormElement>("[data-recruiter-form]")
  .forEach((form) => {
    const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
    const status = form.querySelector<HTMLElement>(".form-status")!;
    const consent = form.elements.namedItem("consent") as HTMLInputElement;
    let attempted = false;
    let sending = false;
    const state = { submissionId: newSubmissionId() };
    attachFileLabels(form);

    function validate() {
      const data = Object.fromEntries(new FormData(form));
      const errors: Record<string, string> = validateRecruiter({
        ...data,
        consent: consent.checked,
      });
      const jd = (form.elements.namedItem("jobDescription") as HTMLInputElement).files?.[0];
      const uploadError = validateUpload(jd);
      if (uploadError) errors.jobDescription = uploadError;
      for (const el of Array.from(form.elements).filter(isControl)) {
        const error = form.querySelector<HTMLElement>(`#${el.id}-error`);
        if (error) error.textContent = errors[el.name] || "";
        el.setAttribute("aria-invalid", String(Boolean(errors[el.name])));
      }
      return errors;
    }

    form.addEventListener("input", () => {
      if (!attempted) return;
      validate();
      status.textContent = "";
    });
    form.addEventListener("change", () => {
      if (attempted) validate();
    });
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (sending) return;
      attempted = true;
      const errors = validate();
      if (Object.keys(errors).length) {
        status.className = "form-status is-error";
        status.textContent = "Please check the highlighted fields.";
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
        return;
      }
      sending = true;
      if (await runSubmission(form, "recruiter", "jobDescription", state)) attempted = false;
      sending = false;
    });
    submit.disabled = false;
  });
