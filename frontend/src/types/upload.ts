export type UploadedDocument = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
  extractionStatus?: "ready" | "empty" | "failed";
  textLength?: number;
  textPreview?: string;
  url: string;
};

export type UploadDocumentResponse = {
  message: string;
  file: UploadedDocument;
};
