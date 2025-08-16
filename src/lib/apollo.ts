// src/lib/apollo.ts
import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";

// HTTP for queries/mutations
const httpLink = new HttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL || process.env.REACT_APP_GRAPHQL_URL,
  headers: {
    "x-hasura-admin-secret": import.meta.env.VITE_HASURA_ADMIN_SECRET || process.env.REACT_APP_HASURA_ADMIN_SECRET,
  },
});

// Only create WS link if a valid URL exists
let wsLink: GraphQLWsLink | null = null;
const wsUrl = import.meta.env.VITE_HASURA_WS_URL || process.env.REACT_APP_GRAPHQL_WS_URL;
if (wsUrl) {
  wsLink = new GraphQLWsLink(
    createClient({
      url: wsUrl,
      connectionParams: {
        headers: {
          "x-hasura-admin-secret": import.meta.env.VITE_HASURA_ADMIN_SECRET || process.env.REACT_APP_HASURA_ADMIN_SECRET,
        },
      },
    })
  );
}

// Split link if wsLink exists, else just use httpLink
const link = wsLink
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    )
  : httpLink;

export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});
