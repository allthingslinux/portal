import { readFile } from "node:fs/promises";
import { type NextRequest, NextResponse } from "next/server";

import { storageService } from "~/lib/storage/storage.service";
import { HTTP_STATUS } from "~/shared/constants";

/**
 * File serving route
 * Serves uploaded files publicly
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathParts = path;
    if (pathParts.length < 2) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const bucketName = pathParts[0]; // bucketName
    const filePath = pathParts.slice(1).join("/"); // rest of the path

    const filePathOnDisk = storageService.getFilePath(bucketName, filePath);
    const fileExists = await storageService.fileExists(bucketName, filePath);

    if (!fileExists) {
      return NextResponse.json(
        { error: "File not found" },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    const fileBuffer = await readFile(filePathOnDisk);

    // Determine content type from file extension
    const ext = filePath.split(".").pop()?.toLowerCase();
    const contentType = getContentType(ext);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to serve file",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

function getContentType(ext?: string): string {
  const contentTypes: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    txt: "text/plain",
    json: "application/json",
  };

  return contentTypes[ext || ""] || "application/octet-stream";
}
