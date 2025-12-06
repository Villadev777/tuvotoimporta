export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  onRetry?: (attempt: number, error: Error) => void;
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly isRetryable: boolean = true
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry,
  } = options;

  let lastError: Error;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        break;
      }

      if (error instanceof NetworkError && !error.isRetryable) {
        throw error;
      }

      if (onRetry) {
        onRetry(attempt + 1, lastError);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw new NetworkError(
    `Error después de ${maxRetries + 1} intentos: ${lastError!.message}`,
    undefined,
    false
  );
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('timeout') ||
      error.message.includes('connection')
    );
  }
  return false;
}

export function createNetworkError(error: unknown): NetworkError {
  if (error instanceof NetworkError) {
    return error;
  }

  if (error instanceof Error) {
    const isRetryable = isNetworkError(error);
    return new NetworkError(error.message, undefined, isRetryable);
  }

  return new NetworkError('Error de red desconocido', undefined, true);
}
