import { ApolloClient } from '@apollo/client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { HttpLink } from 'apollo-link-http'

const cache = new InMemoryCache({
  dataIdFromObject: (object) => {
    switch (object.__typename) {
      case 'TokenDayData': {
        return `${object.tokenAddress}${object.datetime}`
      }
      case 'FactoryDayData': {
        return `${object.id}${object.dayId}`
      }
      case 'Token': {
        return `${object.tokenAddress}${object.name}`
      }
      case 'Pool': {
        return `${object.poolAddress}${object.datetime}`
      }
      default: {
        return object.id || object._id
      }
    }
  },
})

export const jediSwapClient = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.v2.jediswap.xyz/graphql',
  }),
  cache,
  shouldBatch: true,
})

export const jediSwapClientSepolia = new ApolloClient({
  link: new HttpLink({
    uri: 'https://api.v2.sepolia.jediswap.xyz/graphql',
  }),
  cache,
  shouldBatch: true,
})
