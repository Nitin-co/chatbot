// /home/project/src/lib/apolloClient.ts
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient, Client } from 'graphql-ws'
import { nhost } from '/home/project/src/lib/nhost'

let wsClient: Client | null = null

// Create WS client with token handling
const createWsClient = () =>
  createClient({
    url: import.meta.env.VITE_HASURA_WS_URL!,
    lazy: true,
    retryAttempts: Infinity,
    connectionParams: async () => {
      const token = await nhost.auth.getAccessToken()
      if (!token) return {}
      return { headers: { Authorization: `Bearer ${token}` } }
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

const getWsClient = () => {
  if (!wsClient) wsClient = createWsClient()
  return wsClient
}

const wsLink = new GraphQLWsLink(getWsClient())

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL!,
})

const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getAccessToken()
  return { headers: { ...headers, Authorization: token ? `Bearer ${token}` : '' } }
})

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
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
  },
})

// ⚡ Reconnect WS whenever auth changes
nhost.auth.onAuthStateChanged(async () => {
  if (wsClient) {
    console.log('[WS] Auth changed, disposing WS client...')
    wsClient.dispose()
    wsClient = null
  }
})
