import "server-only";

import { existsSync } from "node:fs";
import { mkdir, stat, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";

const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), "uploads");
const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const STORAGE_PUBLIC_PATH =
  process.env.STORAGE_PUBLIC_PATH || "/api/storage/files";

/**
 * Storage service for file uploads
 * Currently uses local filesystem, can be extended to support S3 or other storage backends
 */
export class StorageService {
  private readonly baseDir: string;

  constructor(baseDir: string = UPLOAD_DIR) {
    this.baseDir = baseDir;
  }

  /**
   * Upload a file to storage
   */
  async uploadFile(
    bucketName: string,
    filePath: string,
    file: Buffer | ArrayBuffer,
    options?: {
      contentType?: string;
      upsert?: boolean;
    }
  ): Promise<{ error: Error | null; url?: string }> {
    try {
      const fullPath = join(this.baseDir, bucketName, filePath);
      const dir = join(this.baseDir, bucketName);

      // Ensure directory exists
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }

      // Check if file exists and upsert is false
      if (!options?.upsert && existsSync(fullPath)) {
        return {
          error: new Error("File already exists"),
        };
      }

      // Write file
      let buffer: Buffer;
      if (file instanceof ArrayBuffer) {
        buffer = Buffer.from(file);
      } else if (file instanceof Buffer) {
        buffer = file;
      } else {
        buffer = Buffer.from(file as ArrayLike<number>);
      }
      await writeFile(fullPath, buffer);

      // Generate public URL
      const url = `${PUBLIC_URL}${STORAGE_PUBLIC_PATH}/${bucketName}/${filePath}`;

      return { error: null, url };
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
      const fullPath = join(this.baseDir, bucketName, filePath);

      if (!existsSync(fullPath)) {
        return { error: null }; // File doesn't exist, consider it deleted
      }

      await unlink(fullPath);
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
    return `${PUBLIC_URL}${STORAGE_PUBLIC_PATH}/${bucketName}/${filePath}`;
  }

  /**
   * Get file path for serving files
   */
  getFilePath(bucketName: string, filePath: string): string {
    return join(this.baseDir, bucketName, filePath);
  }

  /**
   * Check if file exists
   */
  async fileExists(bucketName: string, filePath: string): Promise<boolean> {
    try {
      const fullPath = join(this.baseDir, bucketName, filePath);
      await stat(fullPath);
      return true;
    } catch {
      return false;
    }
  }
}

export const storageService = new StorageService();
