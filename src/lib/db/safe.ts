/**
 * Run a DB operation; on failure (e.g. missing Turso on Vercel) return fallback.
 */
export async function withDbFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error("[scorelive-db]", error);
    return fallback;
  }
}
