// src/lib/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient, Client } from 'graphql-ws'
import { nhost } from './nhost'

let wsClient: Client | null = null

// Function to create or recreate the WebSocket client
const getWsClient = () => {
  if (wsClient) return wsClient

  wsClient = createClient({
    url: import.meta.env.VITE_HASURA_WS_URL!,
    lazy: true, // Connect only when needed
    retryAttempts: Infinity, // Keep retrying on disconnect
    connectionParams: () => {
      const token = nhost.auth.getAccessToken() || ''
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    },
    on: {
      connected: () => console.log('[WS] Connected'),
      closed: () => {
        console.log('[WS] Connection closed, recreating client...')
        wsClient = null // Recreate client on next subscription
      },
    },
  })

  return wsClient
}

// WebSocket link
const wsLink = new GraphQLWsLink(getWsClient())

// HTTP link
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL!,
})

// Auth link for queries/mutations
const authLink = setContext((_, { headers }) => {
  const token = nhost.auth.getAccessToken() || ''
  return {
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`,
    },
  }
})

// Split link to route subscriptions to WS and others to HTTP
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

// Apollo Client
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: 'all' },
    query: { errorPolicy: 'all' },
  },
})

// Optional: Listen to auth state changes to refresh WS connection
nhost.auth.onAuthStateChanged(() => {
  if (wsClient) {
    console.log('[WS] Auth changed, reconnecting...')
    wsClient.dispose() // Close old WS
    wsClient = null    // Recreate on next subscription
  }
})
