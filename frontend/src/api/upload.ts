import type { UploadDocumentResponse } from "@/types/upload";

export const MAX_UPLOAD_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_UPLOAD_EXTENSIONS = [".pdf", ".txt"];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:4000/api";

export function validateUploadFile(file: File) {
  const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;

  if (!ALLOWED_UPLOAD_EXTENSIONS.includes(extension)) {
    throw new Error("Please choose a PDF or TXT file.");
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new Error("File is too large. Maximum size is 5 MB.");
  }
}

export async function uploadDocument(file: File) {
  validateUploadFile(file);

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/uploads`, {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | UploadDocumentResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? "Upload failed.");
  }

  return payload as UploadDocumentResponse;
}

export async function deleteDocument(fileId: string) {
  const response = await fetch(`${API_BASE_URL}/uploads/${fileId}`, {
    method: "DELETE",
  });

  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error(payload?.message ?? "Delete failed.");
  }

  return payload;
}
