"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import {
  FileText,
  Loader2,
  Mic,
  Paperclip,
  Send,
  X,
} from "lucide-react";
import {
  deleteDocument,
  uploadDocument,
  validateUploadFile,
} from "@/api/upload";
import type { UploadDocumentResponse } from "@/types/upload";

type Props = {
  disabled?: boolean;
  onSend?: (message: string) => Promise<void> | void;
};

type PreviewKind = "pdf" | "txt";

type SelectedPreviewFile = {
  id: string;
  file: File;
  originalName: string;
  size: number;
  previewKind: PreviewKind;
  previewUrl?: string;
  previewText?: string;
  lineCount?: number;
};

function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function countTextLines(content: string) {
  return content.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
}

export default function MessageInput({ disabled = false, onSend }: Props) {
  const [value, setValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<SelectedPreviewFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedFilesRef = useRef<SelectedPreviewFile[]>([]);

  useEffect(() => {
    selectedFilesRef.current = selectedFiles;
  }, [selectedFiles]);

  useEffect(() => {
    if (!uploadError) {
      return;
    }

    const timer = window.setTimeout(() => {
      setUploadError("");
    }, 2500);

    return () => window.clearTimeout(timer);
  }, [uploadError]);

  useEffect(() => {
    return () => {
      selectedFilesRef.current.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
    };
  }, []);

  const activeFile =
    selectedFiles.find((file) => file.id === activeFileId) ?? null;
  const isBusy = isUploading || disabled;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = value.trim();

    if (!text && selectedFiles.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadError("");
    const uploadedResponses: UploadDocumentResponse[] = [];

    try {
      for (const file of selectedFiles) {
        uploadedResponses.push(await uploadDocument(file.file));
      }

      if (text) {
        await onSend?.(text);
      }

      selectedFiles.forEach((file) => {
        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });

      setSelectedFiles([]);
      setActiveFileId(null);
      setValue("");
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Unable to upload file."
      );

      await Promise.allSettled(
        uploadedResponses.map((response) => deleteDocument(response.file.id))
      );
    } finally {
      setIsUploading(false);
    }
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setUploadError("");

    try {
      validateUploadFile(selectedFile);

      const extension = getExtension(selectedFile.name);
      const previewKind: PreviewKind = extension === "pdf" ? "pdf" : "txt";
      const previewUrl =
        previewKind === "pdf" ? URL.createObjectURL(selectedFile) : undefined;
      const fileId =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      const previewText =
        previewKind === "txt" ? await selectedFile.text() : undefined;
      const lineCount = previewText ? countTextLines(previewText) : undefined;

      setSelectedFiles((current) => [
        {
          id: fileId,
          file: selectedFile,
          originalName: selectedFile.name,
          size: selectedFile.size,
          previewKind,
          previewUrl,
          previewText,
          lineCount,
        },
        ...current,
      ]);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Unable to prepare file."
      );
    } finally {
      e.target.value = "";
    }
  }

  function handleOpenFilePicker() {
    fileInputRef.current?.click();
  }

  function handleRemoveSelectedFile(fileId: string) {
    setSelectedFiles((current) => {
      const target = current.find((file) => file.id === fileId);

      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      if (activeFileId === fileId) {
        setActiveFileId(null);
      }

      return current.filter((file) => file.id !== fileId);
    });
  }

  function handleOpenPreview(fileId: string) {
    setActiveFileId(fileId);
  }

  function handleClosePreview() {
    setActiveFileId(null);
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <p className="text-xs text-slate-500">
          Upload PDF or TXT files up to 5 MB.
        </p>

        {uploadError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {uploadError}
          </div>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-[28px] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          className="hidden"
          onChange={handleFileChange}
        />

        {selectedFiles.length > 0 ? (
          <div className="-mx-1 mb-4 overflow-x-auto pb-2">
            <div className="flex min-w-max gap-4 px-1">
              {selectedFiles.map((file) => (
                <div
                  key={file.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleOpenPreview(file.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenPreview(file.id);
                    }
                  }}
                  className="group relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <button
                    type="button"
                    title={`Remove ${file.originalName}`}
                    disabled={isUploading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSelectedFile(file.id);
                    }}
                    className="absolute right-3 top-3 z-10 rounded-full bg-white/95 p-1 text-slate-400 shadow-sm transition hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  {file.previewKind === "pdf" && file.previewUrl ? (
                    <div className="pointer-events-none h-full w-full bg-slate-50 p-3">
                      <iframe
                        src={file.previewUrl}
                        title={file.originalName}
                        className="h-full w-full rounded-2xl border-0 bg-white"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full flex-col justify-between p-5">
                      <div className="space-y-3">
                        <FileText className="h-10 w-10 text-slate-300" />
                        <p className="line-clamp-2 text-[15px] font-medium leading-6 text-slate-800">
                          {file.originalName}
                        </p>
                      </div>
                      <p className="text-sm text-slate-500">
                        {file.lineCount ?? 0} line{file.lineCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-white via-white/95 to-transparent px-4 pb-3 pt-8">
                    <span className="rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700">
                      {file.previewKind.toUpperCase()}
                    </span>
                    <span className="max-w-[5.5rem] truncate text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-2">
          <button
            type="button"
            title="Attach file"
            onClick={handleOpenFilePicker}
            disabled={isBusy}
            className="p-2 text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Paperclip className="h-5 w-5" />
            )}
          </button>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={isBusy}
            placeholder="Send a message to your AI assistant..."
            className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            title="Voice input"
            className="p-2 text-slate-400 transition hover:text-slate-600"
          >
            <Mic className="h-5 w-5" />
          </button>
          <button
            type="submit"
            disabled={isBusy}
            className="rounded-2xl bg-indigo-600 p-3 text-white transition hover:bg-indigo-700"
          >
            {isUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>

      {activeFile ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 px-4 py-8">
          <div className="relative max-h-full w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl">
            <button
              type="button"
              title="Close preview"
              onClick={handleClosePreview}
              className="absolute right-6 top-6 z-10 rounded-full p-1 text-slate-400 transition hover:text-slate-900"
            >
              <X className="h-7 w-7" />
            </button>

            <div className="space-y-6 p-8">
              <div className="space-y-3 pr-12">
                <h3 className="text-2xl font-semibold leading-tight text-slate-900">
                  {activeFile.originalName}
                </h3>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <span>{activeFile.previewKind.toUpperCase()}</span>
                  <span>{(activeFile.size / 1024).toFixed(1)} KB</span>
                  {activeFile.previewKind === "txt" ? (
                    <span>
                      {activeFile.lineCount ?? 0} line
                      {(activeFile.lineCount ?? 0) === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="rounded-3xl bg-slate-50 p-4">
                {activeFile.previewKind === "pdf" ? (
                  <iframe
                    src={activeFile.previewUrl}
                    title={activeFile.originalName}
                    className="h-[65vh] min-h-[480px] w-full rounded-2xl border-0 bg-white"
                  />
                ) : (
                  <div className="max-h-[65vh] min-h-[420px] overflow-auto rounded-2xl bg-white p-5">
                    <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                      {activeFile.previewText || "No preview available."}
                    </pre>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
