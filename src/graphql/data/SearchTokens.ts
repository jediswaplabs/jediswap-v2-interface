import gql from 'graphql-tag'
import { useMemo } from 'react'
import invariant from 'tiny-invariant'

import { ARB, WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { Chain, SearchTokensQuery, useSearchTokensQuery } from './types-and-hooks'
import { BACKEND_SUPPORTED_CHAINS, chainIdToBackendName } from './util'

gql`
  query SearchTokens($searchQuery: String!) {
    searchTokens(searchQuery: $searchQuery) {
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

const ARB_ADDRESS = ARB.address.toLowerCase()

export type SearchToken = NonNullable<NonNullable<SearchTokensQuery['searchTokens']>[number]>

/* Returns the more relevant cross-chain token based on native status and search chain */
function dedupeCrosschainTokens(current: SearchToken, existing: SearchToken | undefined, searchChain: Chain) {
  if (!existing) {
    return current
  }
  invariant(current.project?.id === existing.project?.id, 'Cannot dedupe tokens within different tokenProjects')

  // Special case: always prefer Arbitrum ARB over Mainnet ARB
  if (current.address?.toLowerCase() === ARB_ADDRESS) {
    return current
  }
  if (existing.address?.toLowerCase() === ARB_ADDRESS) {
    return existing
  }

  // Always prioritize natives, and if both tokens are native, prefer native on current chain (i.e. Matic on Polygon over Matic on Mainnet )
  if (current.standard === 'NATIVE' && (existing.standard !== 'NATIVE' || current.chain === searchChain)) {
    return current
  }

  // Prefer tokens on the searched chain, otherwise prefer mainnet tokens
  if (current.chain === searchChain || (existing.chain !== searchChain && current.chain === Chain.Ethereum)) {
    return current
  }

  return existing
}

/* Places natives first, wrapped native on current chain next, then sorts by volume */
function searchTokenSortFunction(
  searchChain: Chain,
  wrappedNativeAddress: string | undefined,
  a: SearchToken,
  b: SearchToken
) {
  if (a.standard === 'NATIVE') {
    if (b.standard === 'NATIVE') {
      if (a.chain === searchChain) {
        return -1
      }
      if (b.chain === searchChain) {
        return 1
      }
      return 0
    }
    return -1
  }
  if (b.standard === 'NATIVE') {
    return 1
  }
  if (wrappedNativeAddress && a.address === wrappedNativeAddress) {
    return -1
  }
  if (wrappedNativeAddress && b.address === wrappedNativeAddress) {
    return 1
  }
  return (b.market?.volume24H?.value ?? 0) - (a.market?.volume24H?.value ?? 0)
}

export function useSearchTokens(searchQuery: string, chainId: string) {
  const { data, loading, error } = useSearchTokensQuery({
    variables: {
      searchQuery,
    },
    skip: !searchQuery,
  })

  const sortedTokens = useMemo(() => {
    const searchChain = chainIdToBackendName(chainId)
    // Stores results, allowing overwriting cross-chain tokens w/ more 'relevant token'
    const selectionMap: { [projectId: string]: SearchToken } = {}
    const filteredTokens = data?.searchTokens?.filter((token) =>
      (BACKEND_SUPPORTED_CHAINS as ReadonlyArray<Chain>).includes(token.chain)
    )
    // filteredTokens?.forEach((token) => {
    //   if (token.project?.id) {
    //     const existing = selectionMap[token.project.id]
    //     selectionMap[token.project.id] = dedupeCrosschainTokens(token, existing, searchChain)
    //   }
    // })
    return []
  }, [data, chainId])

  return {
    data: sortedTokens,
    loading,
    error,
  }
}
