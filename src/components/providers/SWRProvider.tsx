'use client'

import { SWRConfig } from 'swr'
import { ReactNode } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        dedupingInterval: 60000,
        shouldRetryOnError: false,
        keepPreviousData: true,
        errorRetryCount: 2,
        errorRetryInterval: 5000,
      }}
    >
      {children}
    </SWRConfig>
  )
}