"use client"

import useSWR, { type SWRConfiguration, mutate as globalMutate } from "swr"

interface UseDataOptions<T> extends SWRConfiguration<T> {
  enabled?: boolean
}

export function useData<T = unknown>(
  key: string | null,
  options: UseDataOptions<T> = {}
) {
  const { enabled = true, ...swrOptions } = options

  const { data, error, isLoading, isValidating, mutate } = useSWR<T>(
    enabled ? key : null,
    swrOptions
  )

  return {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
    isEmpty: !isLoading && !error && (!data || (Array.isArray(data) && data.length === 0)),
  }
}

export function useListData<T = unknown>(
  key: string | null,
  options: UseDataOptions<T[]> = {}
) {
  const result = useData<T[]>(key, options)
  return {
    ...result,
    items: result.data || [],
    count: result.data?.length || 0,
  }
}

export async function optimisticUpdate<T>(
  key: string,
  updateFn: (current: T | undefined) => T,
  apiFn: () => Promise<unknown>
) {
  try {
    await globalMutate(
      key,
      async (current: T | undefined) => {
        await apiFn()
        return updateFn(current)
      },
      {
        optimisticData: (current: T | undefined) => updateFn(current),
        rollbackOnError: true,
        revalidate: false,
      }
    )
  } catch (error) {
    await globalMutate(key)
    throw error
  }
}

export function prefetch<T = unknown>(key: string) {
  return globalMutate<T>(key, fetch(key).then(r => r.json()))
}
