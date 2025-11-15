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

export async function DELETE(request: NextRequest) {
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

    const { participationId } = await request.json();

    if (!participationId) {
      return NextResponse.json(
        { success: false, message: 'Participation ID is required' },
        { status: 400 }
      );
    }

    // Verify that the participation belongs to the authenticated user and get the current screenshot key
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

    if (!participation.paymentScreenshotKey) {
      return NextResponse.json(
        { success: false, message: 'No payment screenshot to delete' },
        { status: 400 }
      );
    }

    // Delete the file from S3
    const deletionSuccess = await deleteS3File(participation.paymentScreenshotKey);
    
    if (!deletionSuccess) {
      return NextResponse.json(
        { success: false, message: 'Failed to delete payment screenshot from storage' },
        { status: 500 }
      );
    }

    // Update the participation record to remove the screenshot key
    await prisma.participation.update({
      where: {
        id: participationId,
      },
      data: {
        paymentScreenshotKey: null,
        paymentSubmittedAt: null,
        paymentVerifiedAt: null,
        // Update status back to pending payment
        status: 'PENDING_PAYMENT',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payment screenshot deleted successfully',
    });

  } catch (error) {
    console.error('Delete payment screenshot API error:', error);
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