import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// =============================================================================
// MIDDLEWARE - ROUTE PROTECTION
// =============================================================================
// Protects teacher routes (/teacher/*) - requires Supabase auth
// Student routes (/) don't require auth - they use login codes
// =============================================================================

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Get the session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // Protected routes for teachers
  const teacherRoutes = ['/teacher', '/upload']
  const isTeacherRoute = teacherRoutes.some(route => path.startsWith(route))

  // Auth routes (login/signup)
  const authRoutes = ['/auth/login', '/auth/signup']
  const isAuthRoute = authRoutes.some(route => path.startsWith(route))

  // If trying to access teacher routes without auth, redirect to login
  if (isTeacherRoute && !session) {
    const redirectUrl = new URL('/auth/login', request.url)
    redirectUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(redirectUrl)
  }

  // If logged in and trying to access auth routes, redirect to teacher dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/teacher', request.url))
  }

  return response
}

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
