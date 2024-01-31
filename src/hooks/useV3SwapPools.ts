import { Currency, Token } from '@vnaysn/jediswap-sdk-core'
import { FeeAmount, Pool } from '@vnaysn/jediswap-sdk-v3'
import { useEffect, useMemo, useState } from 'react'
import { useAllCurrencyCombinations } from './useAllCurrencyCombinations'
import { PoolCache, PoolState, usePoolsForSwap } from './usePools'
import { useAccountDetails } from './starknet-react'
import fetchAllPools from 'api/fetchAllPools'
import { useDefaultActiveTokens, useToken } from './Tokens'
import { WETH } from 'constants/tokens'
import { isAddressValidForStarknet } from 'utils/addresses'
import { useContractRead } from '@starknet-react/core'
import POOL_ABI from 'contracts/pool/abi.json'
import { toInt } from 'utils/toInt'

/**
 * Returns all the existing pools that should be considered for swapping between an input currency and an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */

const getPoolProps = (address: string) => {
  // console.log(combo, 'dfkndfkn')
  const { data: tick } = useContractRead({
    functionName: 'get_tick',
    args: [],
    abi: POOL_ABI,
    address,
    watch: true,
  })

  const tickCurrent = useMemo(() => {
    if (tick) return toInt(tick)
    return undefined
  }, [tick])

  const { data: liquidity } = useContractRead({
    functionName: 'get_liquidity',
    args: [],
    abi: POOL_ABI,
    address,
    watch: true,
  })

  const { data: sqrtPriceX96 } = useContractRead({
    functionName: 'get_sqrt_price_X96',
    args: [],
    abi: POOL_ABI,
    address,
    watch: true,
  })

  const { data: token0Address } = useContractRead({
    functionName: 'get_token0',
    args: [],
    abi: POOL_ABI,
    address,
    watch: true,
  })

  const { data: token1Address } = useContractRead({
    functionName: 'get_token1',
    args: [],
    abi: POOL_ABI,
    address,
    watch: true,
  })

  const { data: fee } = useContractRead({
    functionName: 'get_fee',
    args: [],
    abi: POOL_ABI,
    address,
    watch: true,
  })

  const token0 = useToken(token0Address as string)
  const token1 = useToken(token1Address as string)

  return { liquidity, sqrtPriceX96, tickCurrent, token0, token1, fee: Number(fee) }
}

export function useV3SwapPools(
  currencyIn?: Currency,
  currencyOut?: Currency
): {
  pools: Pool[]
  loading: boolean
} {
  const [allPools, setAllPools] = useState<any>()
  const { chainId } = useAccountDetails()

  const allCurrencyCombinations = useAllCurrencyCombinations(currencyIn, currencyOut)

  const allCurrencyCombinationsWithAllFees: [Token, Token, FeeAmount][] = useMemo(
    () =>
      allCurrencyCombinations.reduce<[Token, Token, FeeAmount][]>((list, [tokenA, tokenB]) => {
        return list.concat([
          [tokenA, tokenB, FeeAmount.LOWEST],
          [tokenA, tokenB, FeeAmount.LOW],
          [tokenA, tokenB, FeeAmount.MEDIUM],
          [tokenA, tokenB, FeeAmount.HIGH],
        ])
      }, []),
    [allCurrencyCombinations]
  )
  const allCombinations = [
    '0x3cd526fff0bacfadd9ec5edd46e384d529a92852506a8dfef7443b7304e8a43',
    '0x1ac9b2bf40a0edeec1da69a8a30c76d5ad6f58c38e272da19ebded6d29d46bf',
    '0x6e0d6c071ebe5e1c10d2c874151b46cedb7068d02fd1627a01b00655741be41',
    '0x6ed9ac51eb19e9ab00b25192e7d88cfb173ba0845fc8668fffd952123671600',
  ]

  const poolProps = allCombinations.map((combination) => getPoolProps(combination))

  const pools = usePoolsForSwap(poolProps as any)

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
