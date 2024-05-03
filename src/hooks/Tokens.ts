import { ChainId, Currency, Token } from '@vnaysn/jediswap-sdk-core'
import { useAccountDetails } from 'hooks/starknet-react'
import { getChainInfo } from 'constants/chainInfo'
import { DEFAULT_INACTIVE_LIST_URLS, DEFAULT_LIST_OF_LISTS } from 'constants/lists'
import { parseStringFromArgs, useCurrencyFromMap, useTokenFromMapOrNetwork } from 'lib/hooks/useCurrency'
import { getTokenFilter } from 'lib/hooks/useTokenList/filtering'
import { TokenAddressMap } from 'lib/hooks/useTokenList/utils'
import { useMemo } from 'react'
import { useAppSelector } from 'state/hooks'
import { isL2ChainId } from 'utils/chains'
import ERC20_ABI from 'abis/erc20.json'

import { useAllLists, useCombinedActiveList, useCombinedTokenMapFromUrls } from '../state/lists/hooks'
import { WrappedTokenInfo } from '../state/lists/wrappedTokenInfo'
import { deserializeToken, useUserAddedTokens } from '../state/user/hooks'
import { isAddressValidForStarknet } from 'utils/addresses'
import { useTokenContract } from './useContractV2'
import { NEVER_RELOAD, useSingleCallResult } from 'state/multicall/hooks'
import { ETH_ADDRESS, WETH } from 'constants/tokens'
import { useContractRead } from '@starknet-react/core'
import { BlockTag, num } from 'starknet'

type Maybe<T> = T | null | undefined

// reduce token map into standard address <-> Token mapping, optionally include user added tokens
function useTokensFromMap(tokenMap: TokenAddressMap, chainId: Maybe<ChainId>): { [address: string]: Token } {
  return useMemo(() => {
    if (!chainId) return {}

    // reduce to just tokens
    return Object.keys(tokenMap[chainId] ?? {}).reduce<{ [address: string]: Token }>((newMap, address) => {
      newMap[address] = tokenMap[chainId][address].token
      return newMap
    }, {})
  }, [chainId, tokenMap])
}

// TODO(WEB-2347): after disallowing unchecked index access, refactor ChainTokenMap to not use ?'s
export type ChainTokenMap = { [chainId in string]?: { [address in string]?: Token } }
/** Returns tokens from all token lists on all chains, combined with user added tokens */
export function useAllTokensMultichain(): ChainTokenMap {
  const allTokensFromLists = useCombinedTokenMapFromUrls(DEFAULT_LIST_OF_LISTS)
  const userAddedTokensMap = useAppSelector(({ user: { tokens } }) => tokens)

  return useMemo(() => {
    const chainTokenMap: ChainTokenMap = {}

    if (userAddedTokensMap) {
      Object.keys(userAddedTokensMap).forEach((key) => {
        const chainId = Number(key)
        const tokenMap = {} as { [address in string]?: Token }
        Object.values(userAddedTokensMap[chainId]).forEach((serializedToken) => {
          tokenMap[serializedToken.address] = deserializeToken(serializedToken)
        })
        chainTokenMap[chainId] = tokenMap
      })
    }

    Object.keys(allTokensFromLists).forEach((key) => {
      const chainId = Number(key)
      const tokenMap = chainTokenMap[chainId] ?? {}
      Object.values(allTokensFromLists[chainId]).forEach(({ token }) => {
        tokenMap[token.address] = token
      })
      chainTokenMap[chainId] = tokenMap
    })

    return chainTokenMap
  }, [allTokensFromLists, userAddedTokensMap])
}

/** Returns all tokens from the default list + user added tokens */
export function useDefaultActiveTokens(chainId: Maybe<ChainId>): { [address: string]: Token } {
  const defaultListTokens = useCombinedActiveList()
  const tokensFromMap = useTokensFromMap(defaultListTokens, chainId)
  const userAddedTokens = useUserAddedTokens()
  return useMemo(() => {
    return (
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: Token }>(
          (tokenMap, token) => {
            tokenMap[token.address] = token
            return tokenMap
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          { ...tokensFromMap }
        )
    )
  }, [tokensFromMap, userAddedTokens])
}

type BridgeInfo = Record<
  ChainId,
  {
    tokenAddress: string
    originBridgeAddress: string
    destBridgeAddress: string
  }
>

// export function useUnsupportedTokens(): { [address: string]: Token } {
//   const { chainId } = useAccountDetails()
//   const listsByUrl = useAllLists()
//   const unsupportedTokensMap = useUnsupportedTokenList()
//   const unsupportedTokens = useTokensFromMap(unsupportedTokensMap, chainId)

//   // checks the default L2 lists to see if `bridgeInfo` has an L1 address value that is unsupported
//   const l2InferredBlockedTokens: typeof unsupportedTokens = useMemo(() => {
//     if (!chainId) {
//       return {}
//     }

//     if (!listsByUrl) {
//       return {}
//     }

//     const listUrl = getChainInfo(chainId).defaultListUrl

//     const list = listUrl && listsByUrl[listUrl]?.current
//     if (!list) {
//       return {}
//     }

//     const unsupportedSet = new Set(Object.keys(unsupportedTokens))

//     return list.tokens.reduce((acc: any, tokenInfo: any) => {
//       const bridgeInfo = tokenInfo.extensions?.bridgeInfo as unknown as BridgeInfo
//       if (
//         bridgeInfo &&
//         bridgeInfo[ChainId.MAINNET] &&
//         bridgeInfo[ChainId.MAINNET].tokenAddress &&
//         unsupportedSet.has(bridgeInfo[ChainId.MAINNET].tokenAddress)
//       ) {
//         const address = bridgeInfo[ChainId.MAINNET].tokenAddress
//         // don't rely on decimals--it's possible that a token could be bridged w/ different decimals on the L2
//         return { ...acc, [address]: new Token(ChainId.MAINNET, address, tokenInfo.decimals) }
//       }
//       return acc
//     }, {})
//   }, [chainId, listsByUrl, unsupportedTokens])

//   return { ...unsupportedTokens, ...l2InferredBlockedTokens }
// }

export function useSearchInactiveTokenLists(search: string | undefined, minResults = 10): WrappedTokenInfo[] {
  const lists = useAllLists()
  const inactiveUrls = DEFAULT_INACTIVE_LIST_URLS
  const { chainId } = useAccountDetails()
  const activeTokens = useDefaultActiveTokens(chainId)
  return useMemo(() => {
    if (!search || search.trim().length === 0) return []
    const tokenFilter = getTokenFilter(search)
    const result: WrappedTokenInfo[] = []
    const addressSet: { [address: string]: true } = {}
    for (const url of inactiveUrls) {
      const list = lists[url]?.current
      if (!list) continue
      for (const tokenInfo of list.tokens) {
        if ((tokenInfo.chainId as any) === chainId && tokenFilter(tokenInfo)) {
          try {
            const wrapped: WrappedTokenInfo = new WrappedTokenInfo(tokenInfo, list)
            if (!(wrapped.address in activeTokens) && !addressSet[wrapped.address]) {
              addressSet[wrapped.address] = true
              result.push(wrapped)
              if (result.length >= minResults) return result
            }
          } catch {
            continue
          }
        }
      }
    }
    return result
  }, [activeTokens, chainId, inactiveUrls, lists, minResults, search])
}

// Check if currency is included in custom list from user storage
export function useIsUserAddedToken(currency: Currency | undefined | null): boolean {
  const userAddedTokens = useUserAddedTokens()

  if (!currency) {
    return false
  }

  return !!userAddedTokens.find((token) => currency.equals(token))
}

// undefined if invalid or does not exist
// null if loading or null was passed
// otherwise returns the token
export function useToken(tokenAddress?: string | null): Token | null | undefined {
  const { chainId } = useAccountDetails()
  const tokens = useDefaultActiveTokens(chainId)
  const address = isAddressValidForStarknet(tokenAddress)
  const validTokenAddress = address ? address : undefined
  const token: Token | undefined = address ? tokens[address] : undefined

  const { data: rpc_tokenName } = useContractRead({
    functionName: 'name',
    args: [],
    abi: ERC20_ABI,
    address: validTokenAddress,
    watch: true,
    blockIdentifier: BlockTag.pending,
  })

  const { data: rpc_symbol } = useContractRead({
    functionName: 'symbol',
    args: [],
    abi: ERC20_ABI,
    address: validTokenAddress,
    watch: true,
    blockIdentifier: BlockTag.pending,
  })

  const { data: rpc_decimals } = useContractRead({
    functionName: 'decimals',
    args: [],
    abi: ERC20_ABI,
    address: validTokenAddress,
    watch: true,
    blockIdentifier: BlockTag.pending,
  })

  const tokenName = useMemo(() => {
    const nameResult: any = rpc_tokenName
    if (!nameResult || !nameResult?.name) return undefined
    return num.toHex(nameResult.name)
  }, [rpc_tokenName])

  const symbol = useMemo(() => {
    const symbolResult: any = rpc_symbol
    if (!symbolResult || !symbolResult?.symbol) return undefined
    return num.toHex(symbolResult.symbol)
  }, [rpc_symbol])

  const decimals = useMemo(() => {
    const decimalResult: any = rpc_decimals
    if (!decimalResult || !decimalResult?.decimals) return undefined
    return num.toHex(decimalResult.decimals)
  }, [rpc_decimals])

  return useMemo(() => {
    if (token) return token
    if (!chainId || !address) return undefined
    if (address === ETH_ADDRESS) return WETH[chainId]
    // if (decimals.loading || symbol.loading || tokenName.loading) return null
    if (decimals) {
      const token = new Token(
        chainId,
        address,
        parseInt(decimals),
        parseStringFromArgs(symbol),
        parseStringFromArgs(symbol)
      )
      return token
    }
    return undefined
  }, [address, chainId, decimals, symbol, token, tokenName])
}

export function useCurrency(currencyId: Maybe<string>, chainId?: ChainId): Currency | undefined {
  const { chainId: connectedChainId } = useAccountDetails()
  const tokens = useDefaultActiveTokens(chainId ?? connectedChainId)
  return useCurrencyFromMap(tokens, chainId ?? connectedChainId, currencyId)
}
