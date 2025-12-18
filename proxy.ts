import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// CORS headers for production
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
  'Access-Control-Max-Age': '86400',
}

/**
 * Adds CORS headers to a response
 * @param response - The NextResponse to add headers to
 * @returns The response with CORS headers added
 */
function addCorsHeaders(response: NextResponse): NextResponse {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  return response
}

/**
 * Checks CORS and handles preflight requests
 * @param request - The incoming request
 * @returns NextResponse if it's a preflight request, null otherwise
 */
function checkCORS(request: NextRequest): NextResponse | null {
  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    })
  }
  return null
}

export function proxy(request: NextRequest) {
  // Check CORS and handle preflight requests
  const corsResponse = checkCORS(request)
  if (corsResponse) {
    return corsResponse
  }

  const isProduction = process.env.NODE_ENV === 'production'
  const isApiOnlyMode = process.env.API_ONLY_MODE === 'true'
  
  // In API-only production mode, block all non-API routes
  if (isProduction && isApiOnlyMode) {
    const pathname = request.nextUrl.pathname
    
    // Allow API routes with CORS headers
    if (pathname.startsWith('/api/')) {
      return addCorsHeaders(NextResponse.next())
    }
    
    // Block all other routes (static pages, assets, etc.)
    return new NextResponse('Not Found', { status: 404 })
  }
  
  // In development or non-API-only mode, allow all requests with CORS headers
  return addCorsHeaders(NextResponse.next())
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