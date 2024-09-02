import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import HashPulse from './pages/HashPulse';

const httpLink = createHttpLink({
  uri: 'https://gql.hashnode.com/graphql',
});

const API_TOKEN = import.meta.env.VITE_API_TOKEN;

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${API_TOKEN}`,
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

function App() {
  return (
    <ApolloProvider client={client}>
      <HashPulse/>
    </ApolloProvider>
  );
}

export default App;
