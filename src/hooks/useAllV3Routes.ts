import { ChainId, Currency } from '@vnaysn/jediswap-sdk-core'
import { Pool, Route } from '@vnaysn/jediswap-sdk-v3'
import { useMemo } from 'react'
// import { useUserSingleHopOnly } from '../state/user/hooks'
import { useV3SwapPools } from './useV3SwapPools'
import { useAccountDetails } from './starknet-react'

function computeAllRoutes(
  currencyIn: Currency,
  currencyOut: Currency,
  pools: Pool[],
  chainId: ChainId,
  currentPath: Pool[] = [],
  allPaths: any[] = [],
  startCurrencyIn: Currency = currencyIn,
  maxHops = 2
): any[] {
  const tokenIn = currencyIn.wrapped
  const tokenOut = currencyOut.wrapped
  if (!tokenIn || !tokenOut) {
    throw new Error('Could not wrap currencies')
  }

  for (const pool of pools) {
    if (currentPath.indexOf(pool) !== -1 || !pool.involvesToken(tokenIn)) continue

    const outputToken = pool.token0.equals(tokenIn) ? pool.token1 : pool.token0
    if (outputToken.equals(tokenOut)) {
      allPaths.push(new Route([...currentPath, pool], startCurrencyIn, currencyOut))
    } else if (maxHops > 1) {
      computeAllRoutes(
        outputToken,
        currencyOut,
        pools,
        chainId,
        [...currentPath, pool],
        allPaths,
        startCurrencyIn,
        maxHops - 1
      )
    }
  }

  return allPaths
}

/**
 * Returns all the routes from an input currency to an output currency
 * @param currencyIn the input currency
 * @param currencyOut the output currency
 */
export function useAllV3Routes(
  allPools: string[],
  currencyIn?: Currency,
  currencyOut?: Currency
): { loading: boolean; routes: any[] } {
  const { chainId } = useAccountDetails()
  const { pools, loading: poolsLoading } = useV3SwapPools(allPools, currencyIn, currencyOut)

  // const [singleHopOnly] = useUserSingleHopOnly()
  const singleHopOnly = true

  return useMemo(() => {
    if (poolsLoading || !chainId || !pools || !currencyIn || !currencyOut) return { loading: true, routes: [] }

    const routes = computeAllRoutes(currencyIn, currencyOut, pools, chainId, [], [], currencyIn, singleHopOnly ? 1 : 2)
    return { loading: false, routes }
  }, [chainId, currencyIn, currencyOut, pools, poolsLoading, singleHopOnly])
}
