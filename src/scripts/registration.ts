import districts from "../data/india-districts.json";
import {
  ageOnDate,
  localISODate,
  validateCandidate,
} from "../lib/registration.mjs";
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
      const errors = validateCandidate(
        { ...data, consent: (field("consent") as HTMLInputElement).checked },
        districtMap,
      );
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
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (validating) return;
      validating = true;
      submit.disabled = true;
      attempted = true;
      const errors = validate();
      if (Object.keys(errors).length) {
        status.textContent = "Please check the highlighted fields.";
        form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      } else {
        status.textContent =
          "Online registration is not available yet. Your details have not been submitted or saved. Please call +91 8348623389 for a general enquiry.";
        status.focus();
      }
      validating = false;
      submit.disabled = false;
    });
    submit.disabled = false;
  });
