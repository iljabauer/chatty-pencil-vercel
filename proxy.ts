import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production'
  const isApiOnlyMode = process.env.API_ONLY_MODE === 'true'
  
  // In API-only production mode, block all non-API routes
  if (isProduction && isApiOnlyMode) {
    const pathname = request.nextUrl.pathname
    
    // Allow API routes
    if (pathname.startsWith('/api/')) {
      return NextResponse.next()
    }
    
    // Block all other routes (static pages, assets, etc.)
    return new NextResponse('Not Found', { status: 404 })
  }
  
  // In development or non-API-only mode, allow all requests
  return NextResponse.next()
}

export const config = {
  // Match all paths except Next.js internals and static files
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * But still match API routes in API-only mode
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}