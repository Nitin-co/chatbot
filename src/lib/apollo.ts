import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient, Client } from 'graphql-ws';
import { nhost } from './nhost';

let wsClient: Client | null = null;
let currentToken: string | null = null;

const createWsClient = (token: string) => 
  createClient({
    url: import.meta.env.VITE_HASURA_WS_URL!,
    lazy: true,
    retryAttempts: Infinity,
    connectionParams: {
      headers: { Authorization: `Bearer ${token}` },
    },
    on: {
      connected: () => console.log('[WS] Connected'),
      closed: () => {
        console.log('[WS] WS closed, will recreate on next subscription');
        wsClient = null;
      },
      error: (err) => console.error('[WS] Connection error:', err),
    },
  });

const getWsLink = async () => {
  if (!currentToken) {
    currentToken = await nhost.auth.getAccessToken();
  }
  if (!currentToken) return null; // still no token
  if (!wsClient) wsClient = createWsClient(currentToken);
  return new GraphQLWsLink(wsClient);
};

// HTTP + auth
const httpLink = createHttpLink({ uri: import.meta.env.VITE_HASURA_GRAPHQL_URL! });

const authLink = setContext(async (_, { headers }) => {
  const token = await nhost.auth.getAccessToken();
  currentToken = token;
  return { headers: { ...headers, Authorization: token ? `Bearer ${token}` : '' } };
});

// Apollo client
export const apolloClient = new ApolloClient({
  link: split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
    },
    // Dynamic WS link
    await getWsLink() || httpLink, // fallback to HTTP if WS not ready
    authLink.concat(httpLink)
  ),
  cache: new InMemoryCache(),
  defaultOptions: { watchQuery: { errorPolicy: 'all' }, query: { errorPolicy: 'all' } },
});

// Recreate WS client when auth changes
nhost.auth.onAuthStateChanged(async () => {
  const token = await nhost.auth.getAccessToken();
  currentToken = token;
  if (wsClient) {
    console.log('[WS] Auth changed, disposing old WS client...');
    wsClient.dispose();
    wsClient = null;
  }
});
