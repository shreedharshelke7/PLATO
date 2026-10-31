import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured, getSupabaseUrl, getSupabaseKey } from "@/lib/supabase/client";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const pathname = request.nextUrl.pathname;

  // Check guest cookie
  const isGuest = request.cookies.get("ambrosia_guest")?.value === "true";

  // If Supabase is not configured, allow guest mode for all routes
  if (!isSupabaseConfigured()) {
    return response;
  }

  const url = getSupabaseUrl()!;
  const key = getSupabaseKey()!;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Use verified getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  const isProtectedRoute = [
    "/dashboard",
    "/scan",
    "/log",
    "/water",
    "/swap",
    "/plan",
    "/progress",
    "/coach",
    "/settings",
  ].some((route) => pathname === route || pathname.startsWith(`${route}/`));

  // If user is signed in and visits /login or /signup, redirect to /dashboard
  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If visiting protected route without auth and without guest mode, redirect to /login
  if (isProtectedRoute && !user && !isGuest) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)",
  ],
};
