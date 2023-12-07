import gql from 'graphql-tag'
import { useMemo } from 'react'

import { useTrendingTokensQuery } from './types-and-hooks'
import { chainIdToBackendName, unwrapToken } from './util'
import { ChainId } from '@vnaysn/jediswap-sdk-core'

gql`
  query TrendingTokens($chain: Chain!) {
    topTokens(pageSize: 4, page: 1, chain: $chain, orderBy: VOLUME) {
      id
      decimals
      name
      chain
      standard
      address
      symbol
      market(currency: USD) {
        id
        price {
          id
          value
          currency
        }
        pricePercentChange(duration: DAY) {
          id
          value
        }
        volume24H: volume(duration: DAY) {
          id
          value
          currency
        }
      }
      project {
        id
        logoUrl
        safetyLevel
      }
    }
  }
`

export default function useTrendingTokens(chainId?: ChainId) {
  // const chain = chainIdToBackendName(chainId)
  const { data, loading } = useTrendingTokensQuery({})

  return useMemo(
    () => ({ data: data?.topTokens?.map((token) => unwrapToken(chainId ?? ChainId.MAINNET, token)), loading }),
    [chainId, data?.topTokens, loading]
  )
}
