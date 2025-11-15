import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Handle image optimization requests with better error handling
  if (request.nextUrl.pathname.startsWith('/_next/image')) {
    try {
      // Set cache headers for better performance
      const response = NextResponse.next();
      response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
      
      return response;
    } catch (error) {
      console.error('Image middleware error:', error);
      // Return a proper error response instead of hanging
      return new NextResponse('Image processing error', { 
        status: 500,
        headers: {
          'Content-Type': 'text/plain',
        }
      });
    }
  }

  // Temporarily disabled main middleware to avoid Edge Runtime issues
  // Server-side protection in admin layout and requireAdmin() provides security
  // Registration status checking is handled at the page level
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
    '/_next/image'
  ],
};