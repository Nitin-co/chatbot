import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { nhost } from '/src/lib/nhost'

// HTTP link
const httpLink = createHttpLink({
  uri: 'https://rvmtvbxomszjibeiocvu.hasura.eu-central-1.nhost.run/v1/graphql',
})

// Auth link
const authLink = setContext(async (_, { headers }) => {
  try {
    const token = await nhost.auth.getAccessToken()
    return {
      headers: {
        ...headers,
        ...(token && { authorization: `Bearer ${token}` }),
      },
    }
  } catch (error) {
    console.error('Error getting access token:', error)
    return { headers }
  }
})

// Error link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`)
    )
  }
  if (networkError) {
    console.error(`Network error: ${networkError}`)
  }
})

// Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
  },
})

