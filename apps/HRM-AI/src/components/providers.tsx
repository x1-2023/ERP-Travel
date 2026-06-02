"use client"

import { SessionProvider } from "next-auth/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { SWRConfig } from "swr"
import { Toaster } from "@/components/ui/sonner"
import { ErrorBoundary } from "@/components/error/ErrorBoundary"

const swrFetcher = (url: string) =>
  fetch(url).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return r.json()
  })

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SWRConfig value={{
          fetcher: swrFetcher,
          revalidateOnFocus: false,
          dedupingInterval: 5000,
          keepPreviousData: true,
          errorRetryCount: 2,
        }}>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
          <Toaster position="top-right" richColors theme="dark" />
        </SWRConfig>
      </QueryClientProvider>
    </SessionProvider>
  )
}
