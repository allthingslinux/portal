"use client";

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

/**
 * Client-side storage API
 * Client-side storage API for file uploads and management
 */
export class StorageClient {
  /**
   * Upload a file to storage
   */
  async uploadFile(
    bucketName: string,
    filePath: string,
    file: File | Blob | ArrayBuffer,
    options?: {
      cacheControl?: string;
      upsert?: boolean;
      contentType?: string;
    }
  ): Promise<{ error: Error | null; url?: string }> {
    try {
      const formData = new FormData();

      // Convert ArrayBuffer to Blob if needed
      let fileBlob: Blob;
      if (file instanceof ArrayBuffer) {
        fileBlob = new Blob([file], { type: options?.contentType });
      } else if (file instanceof File) {
        fileBlob = file;
      } else {
        fileBlob = file;
      }

      formData.append("file", fileBlob);
      formData.append("bucketName", bucketName);
      formData.append("filePath", filePath);
      if (options?.upsert) {
        formData.append("upsert", "true");
      }

      const response = await fetch(`${API_BASE_URL}/api/storage/upload`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Failed to upload file",
        }));
        return { error: new Error(error.message || "Failed to upload file") };
      }

      const data = await response.json();
      return { error: null, url: data.url };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error : new Error("Failed to upload file"),
      };
    }
  }

  /**
   * Delete a file from storage
   */
  async deleteFile(
    bucketName: string,
    filePath: string
  ): Promise<{ error: Error | null }> {
    try {
      const params = new URLSearchParams({
        bucketName,
        filePath,
      });

      const response = await fetch(
        `${API_BASE_URL}/api/storage/delete?${params.toString()}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: "Failed to delete file",
        }));
        return { error: new Error(error.message || "Failed to delete file") };
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
   * Get public URL for a file
   */
  getPublicUrl(bucketName: string, filePath: string): string {
    const baseURL = API_BASE_URL;
    return `${baseURL}/api/storage/files/${bucketName}/${filePath}`;
  }
}

export const storageClient = new StorageClient();
