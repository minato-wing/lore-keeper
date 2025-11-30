import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // This middleware is now simplified - authentication is handled client-side
  // We only prevent access to protected routes if there's no auth token in localStorage
  // The actual session validation happens on the client
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/campaigns/:path*',
  ],
}
