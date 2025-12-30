import { type NextRequest, NextResponse } from "next/server";
import { storageService } from "~/core/storage/storage.service";
import { requireUser } from "~/lib/database/require-user";
import { HTTP_STATUS } from "~/shared/constants";

/**
 * File upload API route
 * File upload API route
 */
export async function POST(request: NextRequest) {
  try {
    // Require authenticated user
    await requireUser();

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucketName = formData.get("bucketName") as string | null;
    const filePath = formData.get("filePath") as string | null;
    const upsert = formData.get("upsert") === "true";

    if (!(file && bucketName && filePath)) {
      return NextResponse.json(
        { error: "Missing required fields: file, bucketName, filePath" },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await storageService.uploadFile(
      bucketName,
      filePath,
      arrayBuffer,
      {
        contentType: file.type,
        upsert,
      }
    );

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({
      url: result.url,
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to upload file",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
