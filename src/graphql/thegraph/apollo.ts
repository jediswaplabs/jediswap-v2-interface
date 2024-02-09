import { ApolloClient, ApolloLink, concat, HttpLink, InMemoryCache, NormalizedCacheObject } from '@apollo/client'
import { ChainId } from '@vnaysn/jediswap-sdk-core'

import store from '../../state/index'

const CHAIN_SUBGRAPH_URL: Record<string, string> = {
  [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3?source=uniswap',
}

const CHAIN_BLOCK_SUBGRAPH_URL: Record<string, string> = {
  [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/blocklytics/ethereum-blocks?source=uniswap',
}

const httpLink = new HttpLink({ uri: CHAIN_SUBGRAPH_URL[ChainId.MAINNET] })

// This middleware will allow us to dynamically update the uri for the requests based off chainId
// For more information: https://www.apollographql.com/docs/react/networking/advanced-http-networking/
const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  const chainId = store.getState().application.chainId

  operation.setContext(() => ({
    uri: chainId && CHAIN_SUBGRAPH_URL[chainId] ? CHAIN_SUBGRAPH_URL[chainId] : CHAIN_SUBGRAPH_URL[ChainId.MAINNET],
  }))

  return forward(operation)
})

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  link: concat(authMiddleware, httpLink),
})

export const chainToApolloClient: Record<string, ApolloClient<NormalizedCacheObject>> = {
  [ChainId.MAINNET]: new ApolloClient({
    cache: new InMemoryCache(),
    uri: CHAIN_SUBGRAPH_URL[ChainId.MAINNET],
  }),
}

export const chainToApolloBlockClient: Record<string, ApolloClient<NormalizedCacheObject>> = {
  [ChainId.MAINNET]: new ApolloClient({
    uri: CHAIN_BLOCK_SUBGRAPH_URL[ChainId.MAINNET],
    cache: new InMemoryCache(),
  }),
}
