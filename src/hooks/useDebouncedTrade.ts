// @ts-nocheck
import { Currency, CurrencyAmount, Percent, Token, TradeType } from '@vnaysn/jediswap-sdk-core'
import { useMemo } from 'react'
import { Pair } from '@vnaysn/jediswap-sdk-v2'
import { flatMap } from 'lodash'

import { useAccountDetails } from 'hooks/starknet-react'
import { DebounceSwapQuoteVariant, useDebounceSwapQuoteFlag } from 'featureFlags/flags/debounceSwapQuote'
import { InterfaceTrade, QuoteMethod, RouterPreference, TradeState } from 'state/routing/types'
import { usePreviewTrade } from 'state/routing/usePreviewTrade'
import { useRoutingAPITrade } from 'state/routing/useRoutingAPITrade'
import { useRouterPreference } from 'state/user/hooks'
import useAutoRouterSupported from './useAutoRouterSupported'
import useDebounce from './useDebounce'
import useIsWindowVisible from './useIsWindowVisible'
import { BASES_TO_CHECK_TRADES_AGAINST, WETH } from 'constants/tokens'
import { PairState, useV2Pairs } from './useV2Pairs'
import { wrappedCurrency } from '../utils/wrappedCurrency'

// Prevents excessive quote requests between keystrokes.
const DEBOUNCE_TIME = 350
const DEBOUNCE_TIME_QUICKROUTE = 50

// Temporary until we remove the feature flag.
const DEBOUNCE_TIME_INCREASED = 650

function useAllCommonPairs(currencyA?: Currency, currencyB?: Currency): [Pair[], boolean] {
  const { account, chainId } = useAccountDetails()
  debugger
  const bases: Token[] = useMemo(() => (chainId ? BASES_TO_CHECK_TRADES_AGAINST[chainId] : []), [chainId])

  const [tokenA, tokenB] = chainId
    ? [currencyA?.wrapped, currencyB?.wrapped]
    : [undefined, undefined]

  const basePairs: [Token, Token][] = useMemo(
    () => flatMap(bases, (base): [Token, Token][] => bases.map((otherBase) => [base, otherBase])).filter(
      ([t0, t1]) => t0.address !== t1.address
    ),
    [bases]
  )

  const allPairCombinations: [Token, Token][] = useMemo(
    () => (tokenA && tokenB
      ? [
        // the direct pair
        [tokenA, tokenB],
        // token A against all bases
        ...bases.map((base): [Token, Token] => [tokenA, base]),
        // token B against all bases
        ...bases.map((base): [Token, Token] => [tokenB, base]),
        // each base against all bases
        ...basePairs
      ]
        .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
        .filter(([t0, t1]) => t0.address !== t1.address)
      : []),
    [tokenA, tokenB, bases, basePairs]
  )

  const allPairs = useV2Pairs(allPairCombinations)
  const anyPairLoading = allPairs.some(([pairState]) => pairState === PairState.LOADING)

  // only pass along valid pairs, non-duplicated pairs
  return [
    useMemo(
      () => Object.values(
        allPairs
          // filter out invalid pairs
          .filter((result): result is [PairState.EXISTS, Pair] => Boolean(result[0] === PairState.EXISTS && result[1]))
          // filter out duplicated pairs
          .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
            memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
            return memo
          }, {})
      ),
      [allPairs]
    ),
    anyPairLoading
  ]
}

export function useDebouncedTrade(
  tradeType: TradeType,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency,
  routerPreferenceOverride?: RouterPreference.X,
  account?: string,
  inputTax?: Percent,
  outputTax?: Percent
): {
  state: TradeState
  trade?: InterfaceTrade
  swapQuoteLatency?: number
}

export function useDebouncedTrade(
  tradeType: TradeType,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency,
  routerPreferenceOverride?: RouterPreference.API,
  account?: string,
  inputTax?: Percent,
  outputTax?: Percent
): {
  state: TradeState
  swapQuoteLatency?: number
}

/**
 * Returns the debounced v2+v3 trade for a desired swap.
 * @param tradeType whether the swap is an exact in/out
 * @param amountSpecified the exact amount to swap in/out
 * @param otherCurrency the desired output/payment currency
 * @param routerPreferenceOverride force useRoutingAPITrade to use a specific RouterPreference
 * @param account the connected address
 *
 */
export function useDebouncedTrade(
  tradeType: TradeType,
  amountSpecified?: CurrencyAmount<Currency>,
  otherCurrency?: Currency,
  routerPreferenceOverride?: RouterPreference,
  account?: string,
  inputTax?: Percent,
  outputTax?: Percent
): {
  state: TradeState
  trade?: InterfaceTrade
  method?: QuoteMethod
  swapQuoteLatency?: number
} {
  const [allowedPairs, pairLoading] = useAllCommonPairs(amountSpecified?.currency, otherCurrency)
  console.log('allowedPairs: ', allowedPairs)
  // /**
  //  * Returns the best trade for the exact amount of tokens in to the given token out
  //  */
  // export function useTradeExactIn(currencyAmountIn?: CurrencyAmount, currencyOut?: Currency): [Trade | null, boolean] {
  //   const [allowedPairs, pairLoading] = useAllCommonPairs(currencyAmountIn?.currency, currencyOut)
  //
  //   return [
  //     useMemo(() => {
  //       if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
  //         const trade =
  //             Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: 3, maxNumResults: 1 })[0] ??
  //             null
  //
  //         return trade
  //       }
  //       return null
  //     }, [allowedPairs, currencyAmountIn, currencyOut]),
  //     pairLoading || allowedPairs.length === 0
  //   ]
  // }
  //
  // /**
  //  * Returns the best trade for the token in to the exact amount of token out
  //  */
  // export function useTradeExactOut(currencyIn?: Currency, currencyAmountOut?: CurrencyAmount): [Trade | null, boolean] {
  //   const [allowedPairs, pairLoading] = useAllCommonPairs(currencyIn, currencyAmountOut?.currency)
  //
  //   return [
  //     useMemo(() => {
  //       if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
  //         return (
  //             Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, { maxHops: 3, maxNumResults: 1 })[0] ??
  //             null
  //         )
  //       }
  //       return null
  //     }, [allowedPairs, currencyIn, currencyAmountOut]),
  //     pairLoading || allowedPairs.length === 0
  //   ]
  // }
  //

  const { chainId } = useAccountDetails()
  const autoRouterSupported = useAutoRouterSupported()
  const isWindowVisible = useIsWindowVisible()

  const inputs = useMemo<[CurrencyAmount<Currency> | undefined, Currency | undefined]>(
    () => [amountSpecified, otherCurrency],
    [amountSpecified, otherCurrency]
  )
  const debouncedSwapQuoteFlagEnabled = useDebounceSwapQuoteFlag() === DebounceSwapQuoteVariant.Enabled
  const isDebouncing = useDebounce(inputs, debouncedSwapQuoteFlagEnabled ? DEBOUNCE_TIME_INCREASED : DEBOUNCE_TIME) !== inputs

  const isPreviewTradeDebouncing = useDebounce(inputs, DEBOUNCE_TIME_QUICKROUTE) !== inputs

  const isWrap = useMemo(() => {
    if (!chainId || !amountSpecified || !otherCurrency) { return false }
    const weth = WETH[chainId]
    return Boolean(
      (amountSpecified.currency.isNative && weth?.equals(otherCurrency))
        || (otherCurrency.isNative && weth?.equals(amountSpecified.currency))
    )
  }, [amountSpecified, chainId, otherCurrency])

  const [routerPreference] = useRouterPreference()

  const skipBothFetches = !autoRouterSupported || !isWindowVisible || isWrap
  const skipRoutingFetch = skipBothFetches || isDebouncing

  const skipPreviewTradeFetch = skipBothFetches || isPreviewTradeDebouncing

  const previewTradeResult = usePreviewTrade(
    skipPreviewTradeFetch,
    tradeType,
    amountSpecified,
    otherCurrency,
    inputTax,
    outputTax
  )

  // const routingApiTradeResult = useRoutingAPITrade(
  //   skipRoutingFetch,
  //   tradeType,
  //   amountSpecified,
  //   otherCurrency,
  //   routerPreferenceOverride ?? routerPreference,
  //   account,
  //   inputTax,
  //   outputTax
  // )

  return previewTradeResult
}
