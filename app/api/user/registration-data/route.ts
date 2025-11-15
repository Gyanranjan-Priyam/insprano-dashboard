import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // First try to get data from user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        email: true,
        mobileNumber: true,
        whatsappNumber: true,
        aadhaarNumber: true,
        state: true,
        district: true,
        collegeName: true,
        collegeAddress: true,
      },
    });

    // Also get the most recent participation to use as fallback data
    const recentParticipation = await prisma.participation.findFirst({
      where: { userId: session.user.id },
      orderBy: { registeredAt: 'desc' },
      select: {
        fullName: true,
        email: true,
        mobileNumber: true,
        whatsappNumber: true,
        aadhaarNumber: true,
        state: true,
        district: true,
        collegeName: true,
        collegeAddress: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Merge data with priority: user profile > recent participation > empty string
    const registrationData = {
      fullName: user.name || recentParticipation?.fullName || "",
      email: user.email || recentParticipation?.email || "",
      mobileNumber: user.mobileNumber || recentParticipation?.mobileNumber || "",
      whatsappNumber: user.whatsappNumber || recentParticipation?.whatsappNumber || "",
      aadhaarNumber: user.aadhaarNumber || recentParticipation?.aadhaarNumber || "",
      state: user.state || recentParticipation?.state || "",
      district: user.district || recentParticipation?.district || "",
      collegeName: user.collegeName || recentParticipation?.collegeName || "",
      collegeAddress: user.collegeAddress || recentParticipation?.collegeAddress || "",
    };

    // Add metadata about data sources for debugging/analytics
    const metadata = {
      hasProfileData: !!(user.name || user.mobileNumber || user.aadhaarNumber || user.state || user.collegeName),
      hasParticipationData: !!recentParticipation,
      lastParticipationDate: recentParticipation ? new Date().toISOString() : null,
    };

    return NextResponse.json({
      ...registrationData,
      _metadata: metadata
    });
  } catch (error) {
    console.error("Failed to fetch registration data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}