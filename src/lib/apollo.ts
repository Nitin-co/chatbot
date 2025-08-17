// src/lib/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { nhost } from './nhost'

// HTTP Link for queries and mutations
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL || 'https://rvmtvbxomszjibeiocvu.hasura.eu-central-1.nhost.run/v1/graphql',
})

// WebSocket Link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_HASURA_WS_URL || 'wss://rvmtvbxomszjibeiocvu.hasura.eu-central-1.nhost.run/v1/graphql',
    connectionParams: () => {
      const token = nhost.auth.getAccessToken()
      return {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      }
    },
  })
)

// Auth Link to add authentication headers
const authLink = setContext((_, { headers }) => {
  const token = nhost.auth.getAccessToken()
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  }
})

// Split link to route queries/mutations to HTTP and subscriptions to WebSocket
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

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})