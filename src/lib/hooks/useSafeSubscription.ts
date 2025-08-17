// src/hooks/useSafeSubscription.ts
import { useEffect, useState } from 'react'
import { DocumentNode } from 'graphql'
import { ApolloError, useSubscription } from '@apollo/client'
import { apolloClient, getWsClient } from 'lib/apollo' // absolute import

interface SafeSubscriptionOptions<TData> {
  query: DocumentNode
  variables?: Record<string, any>
}

export function useSafeSubscription<TData = any>({
  query,
  variables,
}: SafeSubscriptionOptions<TData>) {
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<ApolloError | null>(null)

  const { data: subData, error: subError } = useSubscription<TData>(query, {
    variables,
    shouldResubscribe: true, // resubscribe on token refresh
  })

  useEffect(() => {
    if (subData) setData(subData)
    if (subError) setError(subError)
  }, [subData, subError])

  // Retry WS if client is not ready
  useEffect(() => {
    const ws = getWsClient()
    if (!ws) {
      console.warn('[SafeSubscription] WS client not ready, retrying...')
      const interval = setInterval(() => {
        const retryWs = getWsClient()
        if (retryWs) clearInterval(interval)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [])

  return { data, error }
}
