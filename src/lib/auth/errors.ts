export interface MappedAuthError {
  message: string;
  isEmailNotConfirmed?: boolean;
  isRateLimit?: boolean;
}

export function mapSupabaseAuthError(
  error: { message?: string; status?: number } | string | null | undefined
): MappedAuthError {
  if (!error) {
    return { message: "An unexpected error occurred. Please try again." };
  }

  const rawMsg = (typeof error === "string" ? error : error.message || "").toLowerCase();

  if (rawMsg.includes("invalid login credentials") || rawMsg.includes("invalid_credentials")) {
    return { message: "Invalid email or password. Please verify your credentials." };
  }

  if (rawMsg.includes("email not confirmed") || rawMsg.includes("email_not_confirmed")) {
    return {
      message: "Please confirm your email address before signing in. Check your inbox for the activation link.",
      isEmailNotConfirmed: true,
    };
  }

  if (rawMsg.includes("user already registered") || rawMsg.includes("user_already_exists")) {
    return { message: "An account with this email already exists. Try signing in instead." };
  }

  if (
    rawMsg.includes("rate limit") ||
    rawMsg.includes("rate_limit") ||
    rawMsg.includes("too many requests") ||
    (typeof error === "object" && error?.status === 429)
  ) {
    return {
      message: "Too many attempts in a short time. Please wait a moment and try again.",
      isRateLimit: true,
    };
  }

  if (rawMsg.includes("failed to fetch") || rawMsg.includes("network") || rawMsg.includes("load failed")) {
    return { message: "Network connection lost. Please check your internet and try again." };
  }

  if (rawMsg.includes("password should be at least")) {
    return { message: "Password must be at least 8 characters long." };
  }

  if (rawMsg.includes("auth_callback_failed") || rawMsg.includes("invalid code")) {
    return { message: "Authentication link has expired or is invalid. Please request a new one." };
  }

  return { message: typeof error === "string" ? error : error.message || "An unexpected authentication error occurred." };
}
