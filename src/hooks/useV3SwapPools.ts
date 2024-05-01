import { useMemo } from 'react'
import { PoolState, usePoolsForSwap } from './usePools'
import { useToken } from './Tokens'
import { useContractRead } from '@starknet-react/core'
import POOL_ABI from 'contracts/pool/abi.json'
import { toInt } from 'utils/toInt'
import { Pool } from '@vnaysn/jediswap-sdk-v3'
import { Currency } from '@vnaysn/jediswap-sdk-core'
import { BlockTag } from 'starknet'

/**
 * Returns all the existing pools that should be considered for swapping between an input currency and an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */

const getPoolProps = (address: string) => {
  const { data: tick } = useContractRead({
    functionName: 'get_tick',
    args: [],
    abi: POOL_ABI,
    address,
    watch: true,
    blockIdentifier: BlockTag.pending,
  })

  const tickCurrent = useMemo(() => {
    return toInt(tick)
  }, [tick])

  const { data: liquidity } = useContractRead({
    functionName: 'get_liquidity',
    args: [],
    abi: POOL_ABI,
    address,
    watch: true,
    blockIdentifier: BlockTag.pending,
  })

  const { data: sqrtPriceX96 } = useContractRead({
    functionName: 'get_sqrt_price_X96',
    args: [],
    abi: POOL_ABI,
    address,
    watch: true,
    blockIdentifier: BlockTag.pending,
  })

  const { data: token0Address } = useContractRead({
    functionName: 'get_token0',
    args: [],
    abi: POOL_ABI,
    address,
    watch: true,
    blockIdentifier: BlockTag.pending,
  })

  const { data: token1Address } = useContractRead({
    functionName: 'get_token1',
    args: [],
    abi: POOL_ABI,
    address,
    watch: true,
    blockIdentifier: BlockTag.pending,
  })

  const { data: fee } = useContractRead({
    functionName: 'get_fee',
    args: [],
    abi: POOL_ABI,
    address,
    watch: true,
    blockIdentifier: BlockTag.pending,
  })

  const token0 = useToken(token0Address as string)
  const token1 = useToken(token1Address as string)

  return { liquidity, sqrtPriceX96, tickCurrent, token0, token1, fee: Number(fee) }
}

export function useV3SwapPools(
  allPools: string[],
  currencyIn?: Currency,
  currencyOut?: Currency
): {
  pools: Pool[]
  loading: boolean
} {
  if (!allPools || !allPools?.length) return { pools: [], loading: false }

  const poolProps = allPools.map((poolAddress: string) => getPoolProps(poolAddress))

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
