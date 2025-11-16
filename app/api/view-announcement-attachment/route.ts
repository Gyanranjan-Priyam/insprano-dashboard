import { NextRequest, NextResponse } from "next/server";
import { S3 } from "@/lib/s3Client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get("key");
    const action = searchParams.get("action") || "view"; // 'view' or 'download'

    if (!key) {
      return NextResponse.json({ error: "File key is required" }, { status: 400 });
    }

    // Generate presigned URL for S3 object
    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME_FILES!,
      Key: key,
    });

    // Set expiry time for the URL (1 hour)
    const signedUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });

    if (action === 'view') {
      // For viewing, we'll redirect to the signed URL
      return NextResponse.redirect(signedUrl);
    } else {
      // For download, return the URL in JSON
      return NextResponse.json({ 
        downloadUrl: signedUrl,
        fileName: key.split('/').pop() || 'attachment', // Extract filename from key
      });
    }

  } catch (error) {
    console.error("Error viewing announcement attachment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}