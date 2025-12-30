"use client";

import { CheckCircle, File, Loader2, Upload, X } from "lucide-react";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
} from "react";
import { useTranslation } from "react-i18next";
import { cn } from "~/components/lib/utils";
import { Button } from "~/components/ui/button";
import type { UseFileUploadReturn } from "~/hooks/use-file-upload";
import { Trans } from "./trans";

const BYTES_IN_KB = 1000;
const SIZE_UNITS = [
  "bytes",
  "KB",
  "MB",
  "GB",
  "TB",
  "PB",
  "EB",
  "ZB",
  "YB",
] as const;

export const formatBytes = (
  bytes: number,
  decimals = 2,
  size?: (typeof SIZE_UNITS)[number]
) => {
  const dm = decimals < 0 ? 0 : decimals;

  if (bytes === 0 || bytes === undefined) {
    return size !== undefined ? `0 ${size}` : "0 bytes";
  }

  const i =
    size !== undefined
      ? SIZE_UNITS.indexOf(size)
      : Math.floor(Math.log(bytes) / Math.log(BYTES_IN_KB));

  return `${Number.parseFloat((bytes / BYTES_IN_KB ** i).toFixed(dm))} ${SIZE_UNITS[i]}`;
};

type DropzoneContextType = Omit<
  UseFileUploadReturn,
  "getRootProps" | "getInputProps"
>;

const DropzoneContext = createContext<DropzoneContextType | undefined>(
  undefined
);

type DropzoneProps = UseFileUploadReturn & {
  className?: string;
};

const Dropzone = ({
  className,
  children,
  getRootProps,
  getInputProps,
  ...restProps
}: PropsWithChildren<DropzoneProps>) => {
  const isSuccess = restProps.isSuccess;
  const isActive = restProps.isDragActive;

  const isInvalid =
    (restProps.isDragActive && restProps.isDragReject) ||
    (restProps.errors.length > 0 && !restProps.isSuccess) ||
    restProps.files.some((file) => file.errors.length !== 0);

  return (
    <DropzoneContext.Provider value={{ ...restProps }}>
      <div
        {...getRootProps({
          className: cn(
            "rounded-lg border bg-card p-6 text-center text-foreground transition-colors duration-300",
            className,
            isSuccess ? "border-solid" : "border-dashed",
            isActive && "border-primary",
            isInvalid && "border-destructive bg-destructive/10"
          ),
        })}
      >
        <input {...getInputProps()} />
        {children}
      </div>
    </DropzoneContext.Provider>
  );
};

const DropzoneContent = ({ className }: { className?: string }) => {
  const {
    files,
    setFiles,
    onUpload,
    loading,
    successes,
    errors,
    maxFileSize,
    maxFiles,
    isSuccess,
  } = useDropzoneContext();

  const { t } = useTranslation();

  const exceedMaxFiles = files.length > maxFiles;

  const handleRemoveFile = useCallback(
    (fileName: string) => {
      setFiles(files.filter((file) => file.name !== fileName));
    },
    [files, setFiles]
  );

  if (isSuccess) {
    return (
      <div
        className={cn(
          "flex flex-row items-center justify-center gap-x-2",
          className
        )}
      >
        <CheckCircle className="text-primary" size={16} />

        <p className="text-primary text-sm">
          <Trans
            i18nKey="common:dropzone.success"
            values={{ count: files.length }}
          />
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {files.map((file, idx) => {
        const fileError = errors.find((e) => e.name === file.name);
        const isSuccessfullyUploaded = !!successes.find(
          (e) => e.name === file.name
        );

        return (
          <div
            className="flex items-center gap-x-4 border-b py-2 first:mt-4 last:mb-4"
            key={`${file.name}-${idx}`}
          >
            {file.type.startsWith("image/") ? (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-muted">
                {/* biome-ignore lint/performance/noImgElement: local blob previews need native img */}
                <img
                  alt={file.name}
                  className="object-cover"
                  decoding={"async"}
                  height={40}
                  src={file.preview}
                  width={40}
                />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded border bg-muted">
                <File size={18} />
              </div>
            )}

            <div className="flex shrink grow flex-col items-start truncate">
              <p className="max-w-full truncate text-sm" title={file.name}>
                {file.name}
              </p>

              {(() => {
                if (file.errors.length > 0) {
                  return (
                    <p className="text-destructive text-xs">
                      {file.errors
                        .map((e) =>
                          e.message.startsWith("File is larger than")
                            ? t(
                                "common:dropzone.errorMessageFileSizeTooLarge",
                                {
                                  size: formatBytes(file.size, 2),
                                  maxSize: formatBytes(maxFileSize, 2),
                                }
                              )
                            : e.message
                        )
                        .join(", ")}
                    </p>
                  );
                }
                if (loading && !isSuccessfullyUploaded) {
                  return (
                    <p className="text-muted-foreground text-xs">
                      <Trans i18nKey="common:dropzone.uploading" />
                    </p>
                  );
                }
                if (fileError) {
                  return (
                    <p className="text-destructive text-xs">
                      <Trans
                        i18nKey="common:dropzone.errorMessage"
                        values={{ message: fileError.message }}
                      />
                    </p>
                  );
                }
                if (isSuccessfullyUploaded) {
                  return (
                    <p className="text-primary text-xs">
                      <Trans i18nKey="common:dropzone.success" />
                    </p>
                  );
                }
                return (
                  <p className="text-muted-foreground text-xs">
                    {formatBytes(file.size, 2)}
                  </p>
                );
              })()}
            </div>

            {!(loading || isSuccessfullyUploaded) && (
              <Button
                className="shrink-0 justify-self-end text-muted-foreground hover:text-foreground"
                onClick={() => handleRemoveFile(file.name)}
                size="icon"
                variant="link"
              >
                <X />
              </Button>
            )}
          </div>
        );
      })}
      {exceedMaxFiles && (
        <p className="mt-2 text-left text-destructive text-sm">
          <Trans
            i18nKey="common:dropzone.errorMaxFiles"
            values={{ count: maxFiles, files: files.length - maxFiles }}
          />
        </p>
      )}
      {files.length > 0 && !exceedMaxFiles && (
        <div className="mt-2">
          <Button
            disabled={files.some((file) => file.errors.length !== 0) || loading}
            onClick={onUpload}
            variant="outline"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <Trans i18nKey="common:dropzone.uploading" />
              </>
            ) : (
              <span className="flex items-center">
                <Upload className="mr-2 h-4 w-4" size={20} />

                <Trans
                  i18nKey="common:dropzone.uploadFiles"
                  values={{
                    count: files.length,
                  }}
                />
              </span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

const DropzoneEmptyState = ({ className }: { className?: string }) => {
  const { maxFiles, maxFileSize, inputRef, isSuccess } = useDropzoneContext();

  if (isSuccess) {
    return null;
  }

  return (
    <div className={cn("flex flex-col items-center gap-y-2", className)}>
      <Upload className="text-muted-foreground" size={20} />

      <p className="text-sm">
        <Trans
          i18nKey="common:dropzone.uploadFiles"
          values={{ count: maxFiles }}
        />
      </p>

      <div className="flex flex-col items-center gap-y-1">
        <p className="text-muted-foreground text-xs">
          <Trans i18nKey="common:dropzone.dragAndDrop" />{" "}
          <button
            className="cursor-pointer underline transition hover:text-foreground"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            <Trans
              i18nKey="common:dropzone.select"
              values={{ count: maxFiles === 1 ? "file" : "files" }}
            />
          </button>{" "}
          <Trans i18nKey="common:dropzone.toUpload" />
        </p>

        {maxFileSize !== Number.POSITIVE_INFINITY && (
          <p className="text-muted-foreground text-xs">
            <Trans
              i18nKey="common:dropzone.maxFileSize"
              values={{ size: formatBytes(maxFileSize, 2) }}
            />
          </p>
        )}
      </div>
    </div>
  );
};

const useDropzoneContext = () => {
  const context = useContext(DropzoneContext);

  if (!context) {
    throw new Error("useDropzoneContext must be used within a Dropzone");
  }

  return context;
};

export { Dropzone, DropzoneContent, DropzoneEmptyState, useDropzoneContext };
