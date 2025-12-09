import { getSupabaseClientKeys } from "~/core/database/supabase/get-supabase-client-keys";

/**
 * Upload a file to Supabase Storage using REST API
 */
export async function uploadFileToStorage(
  bucketName: string,
  filePath: string,
  file: File | Blob | ArrayBuffer,
  options?: {
    cacheControl?: string;
    upsert?: boolean;
    contentType?: string;
  }
): Promise<{ error: Error | null }> {
  const keys = getSupabaseClientKeys();
  const url = `${keys.url}/storage/v1/object/${bucketName}/${filePath}`;

  const headers: HeadersInit = {
    apikey: keys.publicKey,
    Authorization: `Bearer ${keys.publicKey}`,
  };

  if (options?.cacheControl) {
    headers["cache-control"] = options.cacheControl;
  }

  if (options?.contentType) {
    headers["content-type"] = options.contentType;
  }

  if (options?.upsert) {
    headers["x-upsert"] = "true";
  }

  let body: ArrayBuffer | Blob;
  if (file instanceof ArrayBuffer) {
    body = file;
  } else if (file instanceof Blob) {
    body = file;
  } else {
    body = new Blob([file], { type: file.type });
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        error: new Error(error.message || "Failed to upload file"),
      };
    }

    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error : new Error("Failed to upload file"),
    };
  }
}

/**
 * Delete a file from Supabase Storage using REST API
 */
export async function deleteFileFromStorage(
  bucketName: string,
  filePath: string
): Promise<{ error: Error | null }> {
  const keys = getSupabaseClientKeys();
  const url = `${keys.url}/storage/v1/object/${bucketName}/${filePath}`;

  const headers: HeadersInit = {
    apikey: keys.publicKey,
    Authorization: `Bearer ${keys.publicKey}`,
  };

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        error: new Error(error.message || "Failed to delete file"),
      };
    }

    return { error: null };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error : new Error("Failed to delete file"),
    };
  }
}

/**
 * Get public URL for a file in Supabase Storage
 */
export function getPublicUrl(bucketName: string, filePath: string): string {
  const keys = getSupabaseClientKeys();
  return `${keys.url}/storage/v1/object/public/${bucketName}/${filePath}`;
}
