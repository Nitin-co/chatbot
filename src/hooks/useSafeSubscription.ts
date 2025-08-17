// src/hooks/useSafeSubscription.ts
import { useEffect, useState } from 'react'
import { DocumentNode } from 'graphql'
import { useSubscription, ApolloError } from '@apollo/client'
import { getWsClient } from '/home/project/src/lib/apollo'

interface SafeSubscriptionOptions<TData> {
  query: DocumentNode
  variables?: Record<string, any>
  skip?: boolean
  onData?: (data: TData) => void
}

export function useSafeSubscription<TData>({
  query,
  variables,
  skip,
  onData,
}: SafeSubscriptionOptions<TData>) {
  const [retryKey, setRetryKey] = useState(0)
  const [retryCount, setRetryCount] = useState(0)
  const [subError, setSubError] = useState<ApolloError | null>(null)

  const { data, error } = useSubscription<TData>(query, {
    variables,
    skip: skip || !getWsClient(),
    key: retryKey, // force new subscription when retrying
    onData: (result) => {
      onData?.(result.data as TData)
      setSubError(null)
      setRetryCount(0)
    },
    onError: (err: ApolloError) => {
      console.error('Subscription error:', err)
      if (err.protocolErrors?.length) {
        console.error('Protocol error details:', JSON.stringify(err.protocolErrors, null, 2))
      }
      setSubError(err)

      // Exponential backoff retry
      const timeout = Math.min(30000, 1000 * 2 ** retryCount)
      setRetryCount(retryCount + 1)
      setTimeout(() => setRetryKey(prev => prev + 1), timeout)
    },
  })

  return { data, error: subError }
}
