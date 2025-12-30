import { cn } from "~/components/lib/utils";
import { useFileUpload } from "~/hooks/use-file-upload";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "./dropzone";

export const FileUploader = (props: {
  className?: string;
  maxFiles: number;
  bucketName: string;
  path?: string;
  allowedMimeTypes: string[];
  maxFileSize: number | undefined;
  cacheControl?: number;
  onUploadSuccess?: (files: string[]) => void;
}) => {
  const uploader = useFileUpload(props);

  return (
    <div className={cn(props.className)}>
      <Dropzone {...uploader}>
        <DropzoneEmptyState />
        <DropzoneContent />
      </Dropzone>
    </div>
  );
};
