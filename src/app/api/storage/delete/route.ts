import { type NextRequest, NextResponse } from "next/server";

import { requireUser } from "~/core/database/require-user";
import { storageService } from "~/core/storage/storage.service";
import { HTTP_STATUS } from "~/shared/constants";

/**
 * File delete API route
 * File delete API route
 */
export async function DELETE(request: NextRequest) {
  try {
    // Require authenticated user
    await requireUser();

    const { searchParams } = new URL(request.url);
    const bucketName = searchParams.get("bucketName");
    const filePath = searchParams.get("filePath");

    if (!(bucketName && filePath)) {
      return NextResponse.json(
        { error: "Missing required parameters: bucketName, filePath" },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const result = await storageService.deleteFile(bucketName, filePath);

    if (result.error) {
      return NextResponse.json(
        { error: result.error.message },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete file",
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
