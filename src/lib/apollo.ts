// lib/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient, Client } from 'graphql-ws'
import { nhost } from './nhost'

let wsClient: Client | null = null
let currentToken: string | null = null

// Lazy creation of WS client
const createWsClient = (token: string) => {
  return createClient({
    url: import.meta.env.VITE_HASURA_WS_URL!,
    lazy: true,
    retryAttempts: Infinity,
    connectionParams: {
      headers: { Authorization: `Bearer ${token}` },
    },
    on: {
      connected: () => console.log('[WS] Connected'),
      closed: () => {
        console.log('[WS] WS closed, will recreate on next subscription')
        wsClient = null
      },
      error: (err) => console.error('[WS] Connection error:', err),
    },
  })
}

const getWsLink = () => {
  if (!currentToken) {
    console.warn('[WS] No token yet, WS link cannot be created')
    return null
  }
  if (!wsClient) wsClient = createWsClient(currentToken)
  return new GraphQLWsLink(wsClient)
}

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL!,
})

const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getAccessToken()
  currentToken = token
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  }
})

// Split link: subscription vs query/mutation
const createSplitLink = () => {
  const wsLink = getWsLink()
  if (wsLink) {
    return split(
      ({ query }) => {
        const def = getMainDefinition(query)
        return def.kind === 'OperationDefinition' && def.operation === 'subscription'
      },
      wsLink,
      authLink.concat(httpLink)
    )
  }
  // fallback: only HTTP if no token
  return authLink.concat(httpLink)
}

// Apollo Client instance
export const apolloClient = new ApolloClient({
  link: createSplitLink(),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
  },
})

// Recreate WS client when auth changes
nhost.auth.onAuthStateChanged(async () => {
  const token = await nhost.auth.getAccessToken()
  currentToken = token

  if (wsClient) {
    console.log('[WS] Auth changed, disposing old WS client...')
    wsClient.dispose()
    wsClient = null
  }
})
