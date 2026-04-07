/**
 * Extracts the HTTP status code from an axios error response.
 */
export function getHttpStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } })?.response?.status
}
