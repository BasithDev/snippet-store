import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      console.error(
        `[GraphQL error]: Message: ${err.message}, Location: ${err.locations}, Path: ${err.path}`
      );
      
      if (
        err.extensions?.code === 'UNAUTHENTICATED' || 
        err.message.includes('not authenticated') ||
        err.message.includes('token is invalid') ||
        err.message.includes('token expired')
      ) {
        console.log('Authentication error detected in GraphQL response');
      }
    }
  }
  
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
    
    if (networkError.statusCode === 401) {
      console.log('401 Unauthorized error - token may be expired');
    }
  }
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Invalid token format detected');
        return { headers };
      }
      
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.log('Token expired, not including in request');
        return { headers };
      }
      
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${token}`,
        }
      };
    } catch (error) {
      console.error('Error validating token:', error);
      return { headers };
    }
  }
  return { headers };
});

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          getAllSnippets: {
            keyArgs: [],
            merge(existing = { snippets: [], totalCount: 0, hasMore: false }, incoming, { args }) {
              if (!args?.page || args.page === 1) {
                return incoming;
              }
              
              return {
                ...incoming,
                snippets: [...existing.snippets, ...incoming.snippets],
              };
            },
          },
          getMySnippets: {
            keyArgs: [],
            merge(existing = { snippets: [], totalCount: 0, hasMore: false }, incoming, { args }) {
              if (!args?.page || args.page === 1) {
                return incoming;
              }
              
              return {
                ...incoming,
                snippets: [...existing.snippets, ...incoming.snippets],
              };
            },
          },
          searchSnippets: {
            keyArgs: ['query'],
            merge(existing = { snippets: [], totalCount: 0, hasMore: false }, incoming, { args }) {
              if (!args?.page || args.page === 1) {
                return incoming;
              }
              
              return {
                ...incoming,
                snippets: [...existing.snippets, ...incoming.snippets],
              };
            },
          },
        },
      },
      Snippet: {
        keyFields: ['id'],
      },
      User: {
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      nextFetchPolicy: 'cache-first',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default client;
