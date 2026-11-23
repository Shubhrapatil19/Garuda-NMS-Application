/**
 * Error Sanitization Utility for Garuda NMS
 * Transforms raw backend SQL/JDBC exceptions, stack traces, and technical server errors
 * into clean, user-friendly messages for toasts, modals, and alerts.
 */

function extractRawErrorMessage(rawError: unknown): string {
  if (typeof rawError === "string") {
    return rawError;
  }
  if (rawError instanceof Error) {
    return rawError.message;
  }
  if (
    typeof rawError === "object" &&
    rawError !== null &&
    "message" in rawError &&
    typeof (rawError as { message: unknown }).message === "string"
  ) {
    return (rawError as { message: string }).message;
  }
  return String(rawError);
}

function isDatabaseOrSqlError(lower: string, trimmed: string): boolean {
  return (
    lower.includes("sql") ||
    lower.includes("jdbc") ||
    lower.includes("exception executing") ||
    lower.includes("character varying") ||
    lower.includes("syntax error") ||
    lower.includes("gen_random_uuid") ||
    lower.includes("insert into") ||
    lower.includes("select ") ||
    lower.includes("update ") ||
    lower.includes("delete from") ||
    lower.includes("hikaripool") ||
    lower.includes("hibernate") ||
    lower.includes("postgres") ||
    lower.includes("relation ") ||
    lower.includes("table ") ||
    lower.includes("column ") ||
    lower.includes("foreign key") ||
    lower.includes("unique constraint") ||
    lower.includes("duplicate key") ||
    lower.includes("psqlexception") ||
    lower.includes("sqlexception") ||
    trimmed.includes("[ERROR:") ||
    trimmed.includes("[n/a]") ||
    trimmed.includes("VALUES (")
  );
}

function isInternalCrashError(lower: string): boolean {
  return (
    lower.includes("nullpointerexception") ||
    lower.includes("internal server error") ||
    lower.includes("classnotfoundexception") ||
    lower.includes("illegalargumentexception") ||
    lower.includes("at org.") ||
    lower.includes("at com.") ||
    lower.includes("at java.") ||
    lower.includes("stack trace") ||
    lower.includes("traceback (most recent")
  );
}

function isNetworkFailureError(lower: string): boolean {
  return (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("network error") ||
    lower.includes("load failed") ||
    lower.includes("econnrefused") ||
    lower.includes("etimedout") ||
    lower.includes("socket hang up")
  );
}

export function sanitizeApiError(
  rawError: unknown,
  fallbackMessage: string = "Something went wrong. Please try again or contact your administrator."
): string {
  if (!rawError) return fallbackMessage;

  const rawMessage = extractRawErrorMessage(rawError);
  const trimmed = rawMessage.trim();
  if (!trimmed) return fallbackMessage;

  const lower = trimmed.toLowerCase();

  // 1. Detect Database, SQL, JDBC, or ORM Exceptions
  if (isDatabaseOrSqlError(lower, trimmed)) {
    return "Our service encountered a temporary system issue while processing your request. Please try again shortly or contact support.";
  }

  // 2. Detect Stack Traces & Java/Node Internal Server Crashes
  if (isInternalCrashError(lower)) {
    return "An internal server error occurred. Our team has been notified. Please try again later.";
  }

  // 3. Detect Network & Connection Failures
  if (isNetworkFailureError(lower)) {
    return "Unable to reach the Garuda NMS server. Please check your internet connection and try again.";
  }

  // 4. Overly long technical dumps (> 150 characters with code delimiters)
  if (trimmed.length > 150 && (trimmed.includes(";") || trimmed.includes("{") || trimmed.includes("}"))) {
    return fallbackMessage;
  }

  // 5. Clean, genuine user-facing business errors (e.g. "User not found", "Invalid code")
  return trimmed;
}
