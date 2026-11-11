export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const ALLOWED_UPLOAD_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png",
];
export const UPLOAD_ACCEPT = ".pdf,.doc,.docx,.jpg,.jpeg,.png";

/**
 * Check an optional upload. Returns an error message, or "" when acceptable.
 * @param {{ size: number, type: string } | null | undefined} file
 * @returns {string}
 */
export function validateUpload(file) {
  if (!file || file.size === 0) return "";
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type))
    return "Upload a PDF, Word document, JPG or PNG file.";
  if (file.size > MAX_UPLOAD_BYTES) return "The file must be 5 MB or smaller.";
  return "";
}
