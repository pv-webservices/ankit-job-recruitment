// Sends a validated form to the Google Apps Script web app, which appends a
// row to the Google Sheet and stores any uploaded file in Google Drive.
import { formEndpoint } from "../data/site";

const TIMEOUT_MS = 60_000;

export type FormType = "candidate" | "recruiter";
export interface SubmitResult {
  ok: boolean;
  ref?: string;
  error?: string;
}
interface FilePayload {
  name: string;
  mimeType: string;
  data: string;
}

export const isSubmissionEnabled = (): boolean => /^https:\/\//.test(formEndpoint);

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

/** Splits FormData into plain text fields and the (optional) uploaded file. */
export function collect(form: HTMLFormElement, fileField: string) {
  const fields: Record<string, string> = {};
  let file: File | null = null;
  for (const [key, value] of new FormData(form)) {
    if (value instanceof File) {
      if (key === fileField && value.size > 0) file = value;
    } else {
      fields[key] = value;
    }
  }
  return { fields, file };
}

export async function submitForm(
  formType: FormType,
  fields: Record<string, string>,
  file: File | null,
  submissionId: string,
): Promise<SubmitResult> {
  if (!isSubmissionEnabled())
    return { ok: false, error: "Online submission is not configured yet. Please call us." };
  const { website, consent, ...rest } = fields;
  let filePayload: FilePayload | null = null;
  if (file) {
    filePayload = { name: file.name, mimeType: file.type, data: await readAsBase64(file) };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    // text/plain keeps this a "simple" CORS request (no preflight), which Apps Script requires.
    const response = await fetch(formEndpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ formType, submissionId, website: website ?? "", fields: rest, file: filePayload }),
      signal: controller.signal,
      redirect: "follow",
    });
    const result = (await response.json()) as SubmitResult;
    return result.ok ? result : { ok: false, error: result.error || "Submission failed. Please try again." };
  } catch (error: unknown) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    return {
      ok: false,
      error: timedOut
        ? "The request timed out. Your details may still have been received — please call us before resubmitting."
        : "We could not reach the server. Check your connection and try again, or call us.",
    };
  } finally {
    clearTimeout(timer);
  }
}

export const newSubmissionId = (): string =>
  crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Shows the chosen file name inside each drop zone. */
export function attachFileLabels(form: HTMLFormElement): void {
  form.querySelectorAll<HTMLInputElement>('input[type="file"]').forEach((input) => {
    const zone = input.closest<HTMLElement>(".file-drop");
    const label = zone?.querySelector<HTMLElement>("[data-file-name]");
    const fallback = label?.textContent ?? "";
    const update = () => {
      const file = input.files?.[0];
      if (label) label.textContent = file ? file.name : fallback;
      zone?.classList.toggle("has-file", Boolean(file));
    };
    input.addEventListener("change", update);
    form.addEventListener("reset", () => setTimeout(update, 0));
  });
}

/** Shared submit lifecycle: busy button, status message, reset on success. */
export async function runSubmission(
  form: HTMLFormElement,
  formType: FormType,
  fileField: string,
  state: { submissionId: string },
): Promise<boolean> {
  const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
  const status = form.querySelector<HTMLElement>(".form-status")!;
  const label = submit.innerHTML;
  submit.disabled = true;
  submit.setAttribute("aria-busy", "true");
  submit.textContent = "Submitting…";
  status.className = "form-status";
  status.textContent = "Sending your details securely…";
  const { fields, file } = collect(form, fileField);
  let result: SubmitResult;
  try {
    result = await submitForm(formType, fields, file, state.submissionId);
  } catch (error: unknown) {
    result = { ok: false, error: error instanceof Error ? error.message : "Submission failed." };
  }
  submit.disabled = false;
  submit.removeAttribute("aria-busy");
  submit.innerHTML = label;
  if (result.ok) {
    status.className = "form-status is-success";
    status.textContent = `Thank you! Your ${formType === "candidate" ? "application" : "requirement"} has been received. Reference: ${result.ref}. Our team will contact you soon.`;
    form.reset();
    state.submissionId = newSubmissionId();
  } else {
    status.className = "form-status is-error";
    status.textContent = result.error ?? "Submission failed. Please try again.";
  }
  status.focus();
  return result.ok;
}
