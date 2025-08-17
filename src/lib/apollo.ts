import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient, Client } from 'graphql-ws'
import { nhost } from './nhost'

let wsClient: Client | null = null

// Function to create a new WebSocket client
const createWsClient = () =>
  createClient({
    url: import.meta.env.VITE_HASURA_WS_URL!,
    lazy: true,
    retryAttempts: Infinity,
    connectionParams: async () => {
      const token = await nhost.auth.getAccessToken()
      return {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      }
    },
    on: {
      connected: () => console.log('[WS] Connected'),
      closed: () => {
        console.log('[WS] Connection closed, will recreate...')
        wsClient = null
      },
    },
  })

const getWsClient = () => {
  if (!wsClient) wsClient = createWsClient()
  return wsClient
}

// Create WebSocket link
const wsLink = new GraphQLWsLink(getWsClient())

// HTTP link
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL!,
})

// Auth link to attach JWT
const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getAccessToken()
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  }
})

// Split link for subscriptions vs queries/mutations
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

// Apollo client
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
  },
})

// Recreate WS client on auth change
nhost.auth.onAuthStateChanged(() => {
  if (wsClient) {
    console.log('[WS] Auth changed, reconnecting...')
    wsClient.dispose()
    wsClient = null
  }
})
