// src/lib/apollo.ts
import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import { nhost } from './nhost'

// HTTP link
const httpLink = createHttpLink({
  uri: nhost.graphql.getUrl(), // Nhost GraphQL endpoint
})

// Auth link: attach JWT token
const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getAccessToken()
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }
})

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: nhost.graphql.getUrl().replace(/^http/, 'ws'), // ws:// or wss://
    connectionParams: async () => {
      const token = await nhost.auth.getAccessToken()
      return {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      }
    },
  })
)

// Split link: use WS for subscriptions, HTTP for queries/mutations
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
})
