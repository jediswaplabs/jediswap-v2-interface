import { Token, Currency, CurrencyAmount, TokenAmount, TradeType } from '@vnaysn/jediswap-sdk-core'
import { encodeRouteToPath, Route, Trade } from '@vnaysn/jediswap-sdk-v3'
import { BigNumber } from 'ethers'
import { useMemo } from 'react'
import { useSingleContractMultipleData } from '../state/multicall/hooks'
import { useAllV3Routes } from './useAllV3Routes'
import { useContractRead } from '@starknet-react/core'
import SWAP_QUOTER_ABI from 'contracts/swapquoter/abi.json'
import { SWAP_QUOTER_ADDRESS } from 'constants/tokens'
import { CallData, cairo, num } from 'starknet'
import { TradeState } from 'state/routing/types'

// import { useV3Quoter } from './useContract'

export enum V3TradeState {
  LOADING,
  INVALID,
  NO_ROUTE_FOUND,
  VALID,
  SYNCING,
}

const useQuoteExactInput = (compiledCallData: any) => {
  const { data, isError, error } = useContractRead({
    functionName: 'quote_exact_input',
    args: [compiledCallData],
    abi: SWAP_QUOTER_ABI,
    address: SWAP_QUOTER_ADDRESS,
    watch: true,
  })

  return { data, error }
}

/**
 * Returns the best v3 trade for a desired exact input swap
 * @param amountIn the amount to swap in
 * @param currencyOut the desired output currency
 */
export function useBestV3TradeExactIn(
  allPools: string[],
  amountIn?: any,
  currencyOut?: Currency
): { state: TradeState; trade: any | null } {
  // const quoter = useV3Quoter()
  const { routes, loading: routesLoading } = useAllV3Routes(allPools, amountIn?.currency, currencyOut)

  const quoteExactInInputs = useMemo(() => {
    if (routesLoading || !amountIn) return []
    return routes.map((route: Route<Currency, Currency>, index: number) => {
      const isCurrencyInFirst = amountIn?.currency?.address === route.pools[0].token0.address
      const sortedTokens = isCurrencyInFirst
        ? [route.pools[0].token0.address, route.pools[0].token1.address]
        : [route.pools[0].token1.address, route.pools[0].token0.address]
      return {
        path: [...sortedTokens, route.pools[0].fee],
        amountIn: amountIn ? cairo.uint256(`0x${amountIn.raw.toString(16)}`) : 0,
      }
    })
  }, [routes])

  const callData = useMemo(() => {
    if (!quoteExactInInputs || !quoteExactInInputs.length) return
    return quoteExactInInputs[0]
  }, [quoteExactInInputs])

  const compiledCallData = useMemo(() => {
    if (!callData) return
    return CallData.compile(callData)
  }, [callData])

  const { data, error } = useQuoteExactInput(compiledCallData)

  // const { data, isError, error } = useContractRead({
  //   functionName: 'quote_exact_input',
  //   args: [compiledCallData],
  //   abi: SWAP_QUOTER_ABI,
  //   address: SWAP_QUOTER_ADDRESS,
  //   watch: true,
  // })

  // const quotesResults = useSingleContractMultipleData(quoter, 'quoteExactInput', quoteExactInInputs)

  return useMemo(() => {
    if (!amountIn || !currencyOut || !error) {
      return {
        state: TradeState.INVALID,
        trade: null,
      }
    }

    const errorString = error?.message

    // Use a regular expression to extract the value
    const match = errorString.match(/Failure reason: (0x[0-9a-fA-F]+)/)

    // Check if there's a match and retrieve the value
    const failureReason = match ? match[1] : null

    if (routesLoading) {
      return {
        state: TradeState.LOADING,
        trade: null,
      }
    }

    const bestRoute = routes[0]
    const amountOut = failureReason?.toString()

    // const { bestRoute, amountOut } = quotesResults.reduce(
    //   (currentBest: { bestRoute: Route | null; amountOut: BigNumber | null }, { result }, i) => {
    //     if (!result) return currentBest

    //     if (currentBest.amountOut === null) {
    //       return {
    //         bestRoute: routes[i],
    //         amountOut: result.amountOut,
    //       }
    //     } else if (currentBest.amountOut.lt(result.amountOut)) {
    //       return {
    //         bestRoute: routes[i],
    //         amountOut: result.amountOut,
    //       }
    //     }

    //     return currentBest
    //   },
    //   {
    //     bestRoute: null,
    //     amountOut: null,
    //   }
    // )

    if (!bestRoute || !amountOut) {
      return {
        state: TradeState.NO_ROUTE_FOUND,
        trade: null,
      }
    }

    // const isSyncing = quotesResults.some(({ syncing }) => syncing)

    return {
      state: TradeState.VALID,
      trade: Trade.createUncheckedTrade({
        route: bestRoute,
        tradeType: TradeType.EXACT_INPUT,
        inputAmount: amountIn,
        outputAmount: CurrencyAmount.fromRawAmount(currencyOut, num.hexToDecimalString(amountOut)),
      }),
    }
  }, [amountIn, currencyOut, error, routes, routesLoading])
}

/**
 * Returns the best v3 trade for a desired exact output swap
 * @param currencyIn the desired input currency
 * @param amountOut the amount to swap out
 */
export function useBestV3TradeExactOut(allPools: string[], currencyIn?: Currency, amountOut?: any) {
  // : { state: V3TradeState; trade: any | null }
  // const quoter = useV3Quoter()
  const { routes, loading: routesLoading } = useAllV3Routes(allPools, currencyIn, amountOut?.currency)

  // const quoteExactOutInputs = useMemo(() => {
  //   return routes.map((route) => [
  //     encodeRouteToPath(route, true),
  //     amountOut ? `0x${amountOut.raw.toString(16)}` : undefined,
  //   ])
  // }, [amountOut, routes])

  // const quotesResults = useSingleContractMultipleData(quoter, 'quoteExactOutput', quoteExactOutInputs)

  // return useMemo(() => {
  //   if (!amountOut || !currencyIn || quotesResults.some(({ valid }) => !valid)) {
  //     return {
  //       state: V3TradeState.INVALID,
  //       trade: null,
  //     }
  //   }

  //   if (routesLoading || quotesResults.some(({ loading }) => loading)) {
  //     return {
  //       state: V3TradeState.LOADING,
  //       trade: null,
  //     }
  //   }

  //   const { bestRoute, amountIn } = quotesResults.reduce(
  //     (currentBest: { bestRoute: Route | null; amountIn: BigNumber | null }, { result }, i) => {
  //       if (!result) return currentBest

  //       if (currentBest.amountIn === null) {
  //         return {
  //           bestRoute: routes[i],
  //           amountIn: result.amountIn,
  //         }
  //       } else if (currentBest.amountIn.gt(result.amountIn)) {
  //         return {
  //           bestRoute: routes[i],
  //           amountIn: result.amountIn,
  //         }
  //       }

  //       return currentBest
  //     },
  //     {
  //       bestRoute: null,
  //       amountIn: null,
  //     }
  //   )

  //   if (!bestRoute || !amountIn) {
  //     return {
  //       state: V3TradeState.NO_ROUTE_FOUND,
  //       trade: null,
  //     }
  //   }

  //   const isSyncing = quotesResults.some(({ syncing }) => syncing)

  //   return {
  //     state: isSyncing ? V3TradeState.SYNCING : V3TradeState.VALID,
  //     trade: Trade.createUncheckedTrade({
  //       route: bestRoute,
  //       tradeType: TradeType.EXACT_OUTPUT,
  //       inputAmount:
  //         currencyIn instanceof Token
  //           ? new TokenAmount(currencyIn, amountIn.toString())
  //           : CurrencyAmount.ether(amountIn.toString()),
  //       outputAmount: amountOut,
  //     }),
  //   }
  // }, [amountOut, currencyIn, quotesResults, routes, routesLoading])
}
