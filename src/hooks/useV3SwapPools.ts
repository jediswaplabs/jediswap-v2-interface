import { useMemo } from 'react'
import { PoolState, usePoolsForSwap } from './usePools'
import { useDefaultActiveTokens, useToken } from './Tokens'
import { useContractRead } from '@starknet-react/core'
import POOL_ABI from 'contracts/pool/abi.json'
import { toInt, toIntFromHexArray } from 'utils/toInt'
import { Pool } from '@vnaysn/jediswap-sdk-v3'
import { ChainId, Currency, Token } from '@vnaysn/jediswap-sdk-core'
import { BlockTag, num, validateAndParseAddress } from 'starknet'
import { useAccountDetails } from './starknet-react'
import fetchAllPools from 'api/fetchAllPools'
import { useQuery } from 'react-query'
import { providerInstance } from 'utils/getLibrary'
import { ETH_ADDRESS, WETH } from 'constants/tokens'
import { parseStringFromArgs } from 'lib/hooks/useCurrency'

/**
 * Returns all the existing pools that should be considered for swapping between an input currency and an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */

export function useV3SwapPools(
  currencyIn?: Currency,
  currencyOut?: Currency
): {
  pools: Pool[]
  loading: boolean
} {
  const { chainId } = useAccountDetails()

  const v3Pools = useQuery({
    queryKey: [`get_v2_pools/${currencyIn}/${currencyOut}`],
    queryFn: async () => {
      if (!chainId || !currencyIn || !currencyOut) return
      const results = await fetchAllPools(chainId)
      if (results && results.data) {
        const allPoolsArray: number[] = results.data.map((item: any) => validateAndParseAddress(item.contract_address))
        return allPoolsArray
      } else return []
    },
  })

  const checkedPools = useMemo(() => {
    if (!v3Pools || !v3Pools.data) return []
    else return v3Pools.data
  }, [v3Pools, currencyIn, currencyOut])

  const tokens = useDefaultActiveTokens(chainId)

  const poolProperties = useQuery({
    queryKey: [`fetch_pool_props/${currencyIn}/${currencyOut}/${checkedPools}`],
    queryFn: async () => {
      if (!checkedPools.length || !chainId || !currencyIn || !currencyOut) return
      const provider = providerInstance(chainId)
      const allPoolProps = checkedPools.map(async (contractAddress: any) => {
        const tick = await provider.callContract({ entrypoint: 'get_tick', contractAddress })
        const liquidity = await provider.callContract({ entrypoint: 'get_liquidity', contractAddress })
        const sqrtPriceX96 = await provider.callContract({
          entrypoint: 'get_sqrt_price_X96',
          contractAddress,
        })
        const token0Address = await provider.callContract({ entrypoint: 'get_token0', contractAddress })
        const token1Address = await provider.callContract({ entrypoint: 'get_token1', contractAddress })
        const validToken0Address = validateAndParseAddress(token0Address.result[0])
        const validToken1Address = validateAndParseAddress(token1Address.result[0])

        const token0name = await provider.callContract({ entrypoint: 'name', contractAddress: validToken0Address })
        const token0symbol = await provider.callContract({ entrypoint: 'symbol', contractAddress: validToken0Address })
        const token0decimals = await provider.callContract({
          entrypoint: 'decimals',
          contractAddress: validToken0Address,
        })

        const token1name = await provider.callContract({ entrypoint: 'name', contractAddress: validToken1Address })
        const token1symbol = await provider.callContract({ entrypoint: 'symbol', contractAddress: validToken1Address })
        const token1decimals = await provider.callContract({
          entrypoint: 'decimals',
          contractAddress: validToken1Address,
        })

        const getToken0 = () => {
          if (!validToken0Address) return undefined
          else if (tokens[validToken0Address]) return tokens[validToken0Address]
          else if (validToken0Address === ETH_ADDRESS) return WETH[chainId]
          else
            return new Token(
              chainId,
              validToken0Address,
              parseInt(token0decimals.result[0]),
              parseStringFromArgs(token0symbol.result[0]),
              parseStringFromArgs(token0name.result[0])
            )
        }

        const getToken1 = () => {
          if (!validToken1Address) return undefined
          else if (tokens[validToken1Address]) return tokens[validToken1Address]
          else if (validToken1Address === ETH_ADDRESS) return WETH[chainId]
          else
            return new Token(
              chainId,
              validToken1Address,
              parseInt(token1decimals.result[0]),
              parseStringFromArgs(token1symbol.result[0]),
              parseStringFromArgs(token1name.result[0])
            )
        }

        const token0 = getToken0()
        const token1 = getToken1()
        const fee = await provider.callContract({ entrypoint: 'get_fee', contractAddress })
        return {
          token0,
          token1,
          tickCurrent: toIntFromHexArray(tick.result),
          liquidity: liquidity.result[0],
          sqrtPriceX96: sqrtPriceX96.result[0],
          fee: Number(num.hexToDecimalString(fee.result[0])),
        }
      })

      const settledResults = await Promise.allSettled(allPoolProps as any)
      const resolvedResults = settledResults
        .filter((result) => result.status === 'fulfilled')
        .map((result: any) => {
          return result.value
        })

      return resolvedResults
    },
  })

  const pools = usePoolsForSwap(poolProperties.data ?? [])

  return useMemo(() => {
    return {
      pools: pools
        .filter((tuple): tuple is [PoolState.EXISTS, Pool] => {
          return tuple[0] === PoolState.EXISTS && tuple[1] !== null
        })
        .map(([, pool]) => pool),
      loading: pools.some(([state]) => state === PoolState.LOADING),
    }
  }, [pools])
}
