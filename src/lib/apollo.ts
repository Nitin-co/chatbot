// src/lib/apollo.ts
import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { getMainDefinition } from "@apollo/client/utilities";
import { nhost } from "./nhost";

const httpLink = new HttpLink({
  uri: `${nhost.graphql.getUrl()}`,
  headers: async () => {
    const token = await nhost.auth.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});

let wsLink: GraphQLWsLink | null = null;

function createWsLink() {
  return new GraphQLWsLink(
    createClient({
      url: nhost.graphql.getUrl().replace("http", "ws"),
      connectionParams: async () => {
        const token = await nhost.auth.getAccessToken();
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      },
    })
  );
}

wsLink = createWsLink();

const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === "OperationDefinition" && def.operation === "subscription";
  },
  wsLink,
  httpLink
);

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

// 🔑 Refresh Apollo WS link when auth state changes
nhost.auth.onAuthStateChanged(() => {
  wsLink = createWsLink();
});
