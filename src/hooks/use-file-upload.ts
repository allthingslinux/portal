import { useCallback, useState } from "react";

export interface FileWithErrors extends File {
  errors: Array<{ message: string }>;
  preview?: string;
}

export type FileUploadOptions = {
  maxSize?: number;
  acceptedTypes?: string[];
  multiple?: boolean;
  maxFiles?: number;
  bucketName?: string;
  path?: string;
  allowedMimeTypes?: string[];
  maxFileSize?: number;
  cacheControl?: number;
  onUploadSuccess?: (files: string[]) => void;
};

export type FileUploadState = {
  files: FileWithErrors[];
  uploading: boolean;
  error: string | null;
  errors: Array<{ name: string; message: string }>;
  progress: number;
  isSuccess: boolean;
  isDragActive: boolean;
  isDragReject: boolean;
};

export type UseFileUploadReturn = FileUploadState & {
  uploadFiles: (files: File[]) => Promise<void>;
  clearFiles: () => void;
  setFiles: (files: FileWithErrors[]) => void;
  getRootProps: (props?: Record<string, unknown>) => Record<string, unknown>;
  getInputProps: () => Record<string, unknown>;
  onUpload?: () => void;
  loading: boolean;
  successes: Array<{ name: string }>;
  maxFileSize: number;
  maxFiles: number;
  inputRef?: HTMLInputElement | null;
};

export function useFileUpload(
  options: FileUploadOptions = {}
): UseFileUploadReturn {
  const [state, setState] = useState<FileUploadState>({
    files: [],
    uploading: false,
    error: null,
    errors: [],
    progress: 0,
    isSuccess: false,
    isDragActive: false,
    isDragReject: false,
  });

  const uploadFiles = async (files: File[]) => {
    setState((prev) => ({
      ...prev,
      uploading: true,
      error: null,
      errors: [],
      progress: 0,
      isSuccess: false,
    }));

    try {
      const errors: Array<{ name: string; message: string }> = [];
      const filesWithErrors: FileWithErrors[] = files.map(
        (file) =>
          ({
            ...file,
            errors: [] as Array<{ message: string }>,
            preview: URL.createObjectURL(file),
          }) as FileWithErrors
      );

      const maxSize = options.maxFileSize || options.maxSize;
      const acceptedTypes = options.allowedMimeTypes || options.acceptedTypes;

      if (maxSize) {
        const oversizedFiles = filesWithErrors.filter(
          (file) => file.size > maxSize
        );
        if (oversizedFiles.length > 0) {
          for (const file of oversizedFiles) {
            errors.push({ name: file.name, message: "File too large" });
            file.errors.push({ message: "File too large" });
          }
        }
      }

      if (acceptedTypes) {
        const invalidFiles = filesWithErrors.filter(
          (file) => !acceptedTypes.includes(file.type)
        );
        if (invalidFiles.length > 0) {
          for (const file of invalidFiles) {
            errors.push({ name: file.name, message: "Invalid file type" });
            file.errors.push({ message: "Invalid file type" });
          }
        }
      }

      if (errors.length > 0) {
        setState((prev) => ({
          ...prev,
          files: filesWithErrors,
          errors,
          uploading: false,
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        files: filesWithErrors,
        progress: 100,
        uploading: false,
        isSuccess: true,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Upload failed",
        uploading: false,
        isSuccess: false,
      }));
    }
  };

  const clearFiles = () => {
    setState({
      files: [],
      uploading: false,
      error: null,
      errors: [],
      progress: 0,
      isSuccess: false,
      isDragActive: false,
      isDragReject: false,
    });
  };

  const setFiles = (files: FileWithErrors[]) => {
    setState((prev) => ({ ...prev, files }));
  };

  const getRootProps = useCallback(
    (props?: Record<string, unknown>) => ({
      ...props,
      onDragEnter: () => setState((prev) => ({ ...prev, isDragActive: true })),
      onDragLeave: () => setState((prev) => ({ ...prev, isDragActive: false })),
      onDrop: () => setState((prev) => ({ ...prev, isDragActive: false })),
    }),
    []
  );

  const getInputProps = useCallback(
    () => ({
      type: "file",
      multiple: options.multiple,
      accept: options.acceptedTypes?.join(","),
    }),
    [options.multiple, options.acceptedTypes]
  );

  return {
    ...state,
    uploadFiles,
    clearFiles,
    setFiles,
    getRootProps,
    getInputProps,
    loading: state.uploading,
    successes: state.isSuccess
      ? state.files.map((f) => ({ name: f.name }))
      : [],
    maxFileSize: options.maxFileSize || options.maxSize || 0,
    maxFiles: options.maxFiles || (options.multiple ? 10 : 1),
  };
}
