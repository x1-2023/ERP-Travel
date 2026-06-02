/**
 * Shared React Query config for authenticated queries.
 * Prevents 401 retry storms on unauthenticated pages.
 */
export const authQueryConfig = {
  retry: (failureCount: number, error: Error) => {
    if (error?.message?.includes('401') || error?.message?.includes('Unauthorized')) return false
    return failureCount < 2
  },
}
