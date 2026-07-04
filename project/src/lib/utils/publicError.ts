const TECHNICAL_ERROR_PATTERNS = [
  "prisma",
  "database",
  "sql",
  "constraint",
  "foreign key",
  "unique key",
  "uuid",
  "socket",
  "connection",
  "timeout",
  "invalid invocation",
  "unexpected token",
];

export function getPublicErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (!(error instanceof Error)) return fallbackMessage;

  const message = error.message.trim();
  if (!message) return fallbackMessage;

  const normalizedMessage = message.toLowerCase();
  if (
    TECHNICAL_ERROR_PATTERNS.some((pattern) =>
      normalizedMessage.includes(pattern),
    )
  ) {
    return fallbackMessage;
  }

  return message;
}
