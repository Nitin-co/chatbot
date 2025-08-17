// src/hooks/useSafeSubscription.ts
import { useEffect, useState, useRef } from 'react'
import { useSubscription, SubscriptionHookOptions } from '@apollo/client'
import { nhost } from '/home/project/src/lib/nhost'

interface SafeSubscriptionOptions<TData> extends SubscriptionHookOptions<TData> {
  skipUntilToken?: boolean
}

export function useSafeSubscription<TData>(
  subscription: any,
  options: SafeSubscriptionOptions<TData> = {}
) {
  const [token, setToken] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)
  const [subError, setSubError] = useState(false)
  const retryCount = useRef(0)

  // Fetch token and watch for auth changes
  useEffect(() => {
    const fetchToken = async () => {
      try {
        const t = await nhost.auth.getAccessToken()
        setToken(t)
      } catch (err) {
        console.error('Token fetch error:', err)
        setToken(null)
      }
    }

    fetchToken()
    const unsubscribe = nhost.auth.onAuthStateChanged(fetchToken)
    return () => unsubscribe()
  }, [])

  // Subscription
  const sub = useSubscription<TData>(subscription, {
    key: retryKey, // force re-subscription
    skip: options.skipUntilToken && !token,
    ...options,
    onData: (result) => {
      setSubError(false)
      retryCount.current = 0
      options.onData?.(result)
    },
    onError: (err: any) => {
      console.error('Subscription error:', err)
      if (err.protocolErrors && err.protocolErrors.length > 0) {
        console.error('Protocol error details:', JSON.stringify(err.protocolErrors, null, 2))
      }
      setSubError(true)

      // Exponential backoff retry (max 30s)
      const timeout = Math.min(30000, 1000 * 2 ** retryCount.current)
      retryCount.current += 1
      console.log(`Retrying subscription in ${timeout / 1000}s… (attempt ${retryCount.current})`)
      setTimeout(() => setRetryKey(prev => prev + 1), timeout)

      options.onError?.(err)
    },
  })

  return { ...sub, subError }
}
