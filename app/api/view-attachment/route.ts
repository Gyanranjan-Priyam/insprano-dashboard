import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { S3 } from "@/lib/s3Client";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const attachmentId = searchParams.get("attachmentId");
    const action = searchParams.get("action"); // 'view' or 'download'

    if (!attachmentId) {
      return NextResponse.json({ error: "Attachment ID is required" }, { status: 400 });
    }

    // Get attachment from database
    const attachment = await prisma.supportAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    // Generate presigned URL for S3 object
    const command = new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME_FILES!,
      Key: attachment.fileKey,
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
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        fileSize: attachment.fileSize
      });
    }

  } catch (error) {
    console.error("Error viewing attachment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}