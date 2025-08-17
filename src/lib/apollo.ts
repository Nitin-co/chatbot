import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient, Client } from 'graphql-ws'
import { nhost } from './nhost'

let wsClient: Client | null = null
let currentToken: string | null = null

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
        console.log('[WS] Connection closed, will recreate...')
        wsClient = null
      },
      error: (err) => console.error('[WS] Connection error:', err),
    },
  })
}

const getWsClient = () => {
  if (!wsClient && currentToken) wsClient = createWsClient(currentToken)
  return wsClient
}

const wsLink = new GraphQLWsLink(getWsClient()!)

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL!,
})

const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getAccessToken()
  currentToken = token
  return {
    headers: { ...headers, Authorization: token ? `Bearer ${token}` : '' },
  }
})

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
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

// ⚡ Recreate WS client whenever token changes
nhost.auth.onAuthStateChanged(async () => {
  const token = await nhost.auth.getAccessToken()
  currentToken = token
  if (wsClient) {
    console.log('[WS] Auth changed, reconnecting WS...')
    wsClient.dispose()
    wsClient = null
  }
})
