import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { nhost } from './nhost';

// HTTP link for queries/mutations
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL,
  headers: async () => {
    const token = await nhost.auth.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

// WebSocket link for subscriptions
let wsLink: GraphQLWsLink | null = null;
try {
  wsLink = new GraphQLWsLink(
    createClient({
      url: import.meta.env.VITE_HASURA_WS_URL!,
      connectionParams: async () => {
        const token = await nhost.auth.getAccessToken();
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      },
      lazy: true, // connect only when needed
      retryAttempts: 5,
    })
  );
} catch (err) {
  console.error("Failed to create WS link:", err);
}

// Use split for queries/mutations vs subscriptions
const splitLink = wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === 'OperationDefinition' &&
          definition.operation === 'subscription'
        );
      },
      wsLink,
      httpLink
    )
  : httpLink; // fallback to http if wsLink is null

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
