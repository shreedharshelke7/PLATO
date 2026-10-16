/**
 * Validates redirect paths to prevent Open Redirect attacks.
 * Allows only same-origin relative paths starting with a single '/'
 * Blocks '//', '\', absolute URLs ('https://', 'http://'), javascript:, etc.
 */
export function validateRedirectPath(
  path: string | null | undefined,
  defaultPath = "/dashboard"
): string {
  if (!path || typeof path !== "string") {
    return defaultPath;
  }

  const trimmed = path.trim();

  // Must start with exactly one '/' and not followed by another '/' or '\'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return defaultPath;
  }

  // Must not contain backslashes or protocol indicators
  if (trimmed.includes("\\") || trimmed.includes(":") || trimmed.includes("\0")) {
    return defaultPath;
  }

  // Must not be an absolute URI
  try {
    const dummyBase = "http://localhost";
    const parsed = new URL(trimmed, dummyBase);
    if (parsed.origin !== dummyBase) {
      return defaultPath;
    }
  } catch {
    return defaultPath;
  }

  return trimmed;
}
