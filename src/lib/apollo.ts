import { ApolloClient, InMemoryCache, createHttpLink, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { nhost } from "./nhost";

// WebSocket link (factory with auth-aware connection params)
const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_HASURA_WS_URL!,
    lazy: true,
    retryAttempts: Infinity,
    connectionParams: async () => {
      const token = await nhost.auth.getAccessToken();
      return {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      };
    },
    on: {
      connected: () => console.log("[WS] Connected"),
      closed: () => console.log("[WS] Closed"),
    },
  })
);

// HTTP link for queries/mutations
const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL!,
});

// Auth link for attaching headers
const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getAccessToken();
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
});

// Split link: subscriptions (ws) vs queries/mutations (http)
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

// Apollo Client
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { errorPolicy: "all" },
    query: { errorPolicy: "all" },
    mutate: { errorPolicy: "all" },
  },
});

// 🔑 Force WebSocket reconnection when auth changes
nhost.auth.onAuthStateChanged(() => {
  console.log("[WS] Auth changed, forcing reload");
  // easiest fix: reload page so Apollo + wsLink reset with new token
  window.location.reload();
});
