import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentConfirmationEmail } from '@/lib/mailer';
import { generateAccommodationInvoicePDF } from '@/lib/invoice-generator';

export async function POST(request: NextRequest) {
  try {
    // This is a test endpoint - should be protected in production
    const testData = {
      invoiceNumber: 'ACC-INV-2025-TEST123',
      fullName: 'Test User',
      email: 'test@example.com',
      mobileNumber: '9876543210',
      collegeName: 'Test College of Engineering',
      state: 'Odisha',
      district: 'Kalahandi',
      roomType: 'Deluxe AC Room',
      checkInDate: new Date('2024-12-25'),
      checkOutDate: new Date('2024-12-27'),
      numberOfNights: 2,
      stayAmount: 1200,
      mealAmount: 800,
      totalAmount: 2000,
      bookingId: 'test-booking-123',
      paymentDate: new Date(),
      paymentVerifiedDate: new Date(),
      transactionId: 'ACC-TXN123456789',
      paymentMethod: 'Online Transfer',
      selectedMeals: ['Breakfast', 'Dinner']
    };

    // Generate accommodation invoice PDF
    const invoicePDF = await generateAccommodationInvoicePDF(testData);

    // Send payment confirmation email with accommodation invoice
    const result = await sendPaymentConfirmationEmail({
      to: 'test@example.com', // Replace with your email for testing
      participantName: testData.fullName,
      eventTitle: `Accommodation Booking - ${testData.roomType}`,
      eventDate: `Check-in: ${testData.checkInDate.toLocaleDateString('en-US', { 
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
      })}`,
      eventVenue: 'GCEK Campus Accommodation',
      invoiceNumber: testData.invoiceNumber,
      paymentAmount: testData.totalAmount,
      registrationDetails: {
        fullName: testData.fullName,
        mobileNumber: testData.mobileNumber,
        whatsappNumber: '9876543210',
        collegeName: testData.collegeName,
        state: testData.state,
        district: testData.district,
      },
      invoiceBuffer: invoicePDF,
      invoiceFilename: 'test-accommodation-invoice.pdf'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Accommodation payment confirmation email sent successfully',
      result,
      testData: {
        invoiceNumber: testData.invoiceNumber,
        roomType: testData.roomType,
        checkInDate: testData.checkInDate.toISOString(),
        checkOutDate: testData.checkOutDate.toISOString(),
        numberOfNights: testData.numberOfNights,
        stayAmount: testData.stayAmount,
        mealAmount: testData.mealAmount,
        totalAmount: testData.totalAmount,
        selectedMeals: testData.selectedMeals
      }
    });

  } catch (error) {
    console.error('Test accommodation payment confirmation email error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}