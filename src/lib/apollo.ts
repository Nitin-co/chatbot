import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient, Client } from 'graphql-ws'
import { nhost } from './nhost'

let wsClient: Client | null = null

const createWsClient = () => {
  return createClient({
    url: import.meta.env.VITE_HASURA_WS_URL!,
    lazy: true,
    retryAttempts: Infinity,
    connectionParams: async () => {
      const token = await nhost.auth.getAccessToken()
      if (!token) {
        console.warn('[WS] No token available, cannot authenticate WS connection')
        return {}
      }
      return { headers: { Authorization: `Bearer ${token}` } }
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
  if (!wsClient) wsClient = createWsClient()
  return wsClient
}

const wsLink = new GraphQLWsLink(getWsClient())

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL!,
})

const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getAccessToken()
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

nhost.auth.onAuthStateChanged(() => {
  if (wsClient) {
    console.log('[WS] Auth changed, reconnecting...')
    wsClient.dispose()
    wsClient = null
  }
})
