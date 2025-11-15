import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { prisma } from '@/lib/db';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from '@/lib/s3Client';
import { env } from '@/lib/env';

// Helper function to delete file from S3
async function deleteS3File(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
      Key: key,
    });
    
    await S3.send(command);
    console.log(`Successfully deleted S3 file: ${key}`);
    return true;
  } catch (error) {
    console.error(`Failed to delete S3 file: ${key}`, error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { participationId, paymentScreenshotKey } = await request.json();

    if (!participationId || !paymentScreenshotKey) {
      return NextResponse.json(
        { success: false, message: 'Participation ID and payment screenshot are required' },
        { status: 400 }
      );
    }

    // Verify that the participation belongs to the authenticated user
    const participation = await prisma.participation.findFirst({
      where: {
        id: participationId,
        userId: session.user.id,
      },
      select: {
        id: true,
        paymentScreenshotKey: true,
      },
    });

    if (!participation) {
      return NextResponse.json(
        { success: false, message: 'Participation not found or access denied' },
        { status: 404 }
      );
    }

    // Delete old payment screenshot from S3 if it exists
    if (participation.paymentScreenshotKey) {
      const deletionSuccess = await deleteS3File(participation.paymentScreenshotKey);
      if (!deletionSuccess) {
        console.warn(`Warning: Failed to delete old payment screenshot: ${participation.paymentScreenshotKey}`);
        // Continue with the update even if old file deletion fails
      }
    }

    // Update the participation with new payment screenshot
    await prisma.participation.update({
      where: {
        id: participationId,
      },
      data: {
        paymentScreenshotKey,
        paymentSubmittedAt: new Date(),
        // Reset verification status since it's a new screenshot
        paymentVerifiedAt: null,
        // Update status to indicate payment has been submitted
        status: 'PAYMENT_SUBMITTED',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment screenshot updated successfully',
      data: {
        oldScreenshotDeleted: !!participation.paymentScreenshotKey,
        newScreenshotKey: paymentScreenshotKey,
      },
    });

  } catch (error) {
    console.error('Reupload payment API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method not allowed' },
    { status: 405 }
  );
}