// src/lib/apollo.ts
import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// HTTP for queries/mutations
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL,
  headers: {
    "x-hasura-admin-secret": import.meta.env.VITE_HASURA_ADMIN_SECRET,
  },
});

// WS for subscriptions
const wsLink = new GraphQLWsLink(
  createClient({
    url: import.meta.env.VITE_HASURA_WS_URL!,
    connectionParams: {
      headers: {
        "x-hasura-admin-secret": import.meta.env.VITE_HASURA_ADMIN_SECRET,
      },
    },
  })
);

// Split based on operation type
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});
