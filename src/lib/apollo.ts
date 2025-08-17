import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { nhost } from './nhost'

// HTTP link with auth
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL!,
})

const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getAccessToken()
  return {
    headers: { ...headers, Authorization: token ? `Bearer ${token}` : '' },
  }
})

// WebSocket link with token injected dynamically
const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_HASURA_WS_URL!,
    lazy: true,
    retryAttempts: Infinity,
    connectionParams: async () => {
      const token = await nhost.auth.getAccessToken()
      return token ? { headers: { Authorization: `Bearer ${token}` } } : {}
    },
    on: {
      connected: () => console.log('[WS] Connected'),
      closed: () => console.log('[WS] Closed'),
      error: (err) => console.error('[WS] Error', err),
    },
  })
)

// Split queries and subscriptions
const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query)
    return def.kind === 'OperationDefinition' && def.operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink)
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: { watchQuery: { errorPolicy: 'all' }, query: { errorPolicy: 'all' } },
})

// Recreate WS client on auth change
nhost.auth.onAuthStateChanged(() => {
  console.log('[WS] Auth changed, reloading subscriptions...')
  wsLink.client.dispose()
})
