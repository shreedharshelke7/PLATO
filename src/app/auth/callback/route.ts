import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateRedirectPath } from "@/lib/utils/redirect";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next");
  const targetPath = validateRedirectPath(nextParam, "/dashboard");

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(targetPath, request.url));
      }
    }
  }

  // If code exchange failed or supabase not configured, redirect to login with error
  const fallbackUrl = new URL("/login", request.url);
  fallbackUrl.searchParams.set("error", "auth_callback_failed");
  return NextResponse.redirect(fallbackUrl);
}
