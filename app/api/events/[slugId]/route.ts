import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlugId, updateEvent } from '@/app/data/admin/events';
import { eventSchema } from '@/lib/zodSchema';
import { z } from 'zod';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slugId: string }> }
) {
  try {
    const { slugId } = await params;
    const event = await getEventBySlugId(slugId);
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Event not found' },
      { status: 404 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slugId: string }> }
) {
  try {
    const { slugId } = await params;
    const body = await request.json();
    
    // Validate the request body (z.coerce.date will handle string conversion)
    const validatedData = eventSchema.parse(body);
    
    const updatedEvent = await updateEvent(slugId, {
      title: validatedData.title,
      description: validatedData.description,
      rules: validatedData.rules,
      thumbnailKey: validatedData.thumbnailKey,
      pdfKey: validatedData.pdfKey,
      imageKeys: validatedData.imageKeys,
      price: validatedData.price,
      venue: validatedData.venue,
      date: validatedData.date,
      category: validatedData.category,
    });
    
    return NextResponse.json({
      status: 'success',
      message: 'Event updated successfully',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Error updating event:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Validation error',
          errors: error.issues 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to update event' 
      },
      { status: 500 }
    );
  }
}