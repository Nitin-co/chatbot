// src/lib/apollo.ts
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { nhost } from "./nhost";

export const apolloClient = new ApolloClient({
  link: nhost.apolloLink,
  cache: new InMemoryCache(),
});