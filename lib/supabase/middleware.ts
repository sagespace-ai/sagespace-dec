import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If Supabase is not configured, allow all navigation without auth checks
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("[v0] Supabase not configured, allowing all routes")
    return supabaseResponse
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    // IMPORTANT: Do not run code between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.log("[v0] Supabase auth error in middleware:", error.message)
      return supabaseResponse
    }

    const isProtectedRoute =
      request.nextUrl.pathname.startsWith("/council") ||
      request.nextUrl.pathname.startsWith("/memory") ||
      request.nextUrl.pathname.startsWith("/multiverse") ||
      request.nextUrl.pathname.startsWith("/observatory") ||
      request.nextUrl.pathname.startsWith("/persona-editor") ||
      request.nextUrl.pathname.startsWith("/playground") ||
      request.nextUrl.pathname.startsWith("/universe-map") ||
      request.nextUrl.pathname.startsWith("/marketplace") ||
      request.nextUrl.pathname.startsWith("/profile") ||
      request.nextUrl.pathname.startsWith("/credits") ||
      request.nextUrl.pathname.startsWith("/governance") ||
      request.nextUrl.pathname.startsWith("/pricing") ||
      request.nextUrl.pathname.startsWith("/referrals")

    if (isProtectedRoute && !user) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("redirect", request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    const isAuthPage =
      request.nextUrl.pathname.startsWith("/auth/login") || request.nextUrl.pathname.startsWith("/auth/signup")

    if (isAuthPage && user) {
      const url = request.nextUrl.clone()
      url.pathname = "/multiverse"
      return NextResponse.redirect(url)
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is.
    return supabaseResponse
  } catch (error) {
    console.log("[v0] Error in middleware, allowing navigation:", error)
    return supabaseResponse
  }
}
