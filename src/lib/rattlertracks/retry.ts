export interface RetryOptions {
  /** Total number of attempts, including the first one. */
  maxAttempts: number;
  /** Delay before the first retry; each later retry waits twice as long. */
  baseDelayMs: number;
  /** Return false for errors that won't go away by retrying (e.g. a 404). */
  shouldRetry: (error: unknown) => boolean;
  sleep: (ms: number) => Promise<void>;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
}

/**
 * Runs `operation`, retrying failures with exponential backoff.
 * Throws the last error once attempts run out or the error isn't retryable.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isLastAttempt = attempt >= options.maxAttempts;
      if (isLastAttempt || !options.shouldRetry(error)) throw error;

      const delayMs = options.baseDelayMs * 2 ** (attempt - 1);
      options.onRetry?.(error, attempt, delayMs);
      await options.sleep(delayMs);
    }
  }
}
