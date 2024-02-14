import { Pair, Trade } from '@vnaysn/jediswap-sdk-v2'
import { useAccountDetails } from './starknet-react'
import { Currency, CurrencyAmount, Token, TradeType } from '@vnaysn/jediswap-sdk-core'
import { useMemo } from 'react'
import { PairState, useV2Pairs } from './useV2Pairs'
import { BASES_TO_CHECK_TRADES_AGAINST } from 'constants/tokens'
import flatMap from 'array.prototype.flatmap'

function useAllCommonPairs(pairs: string[] | [], currencyA?: Currency, currencyB?: Currency): [Pair[], boolean] {
  const { chainId } = useAccountDetails()

  const bases: Token[] = useMemo(() => (chainId ? BASES_TO_CHECK_TRADES_AGAINST[chainId] : []), [chainId])

  const [tokenA, tokenB] = chainId ? [currencyA?.wrapped, currencyB?.wrapped] : [undefined, undefined]

  const basePairs: [Token, Token][] = useMemo(
    () =>
      flatMap(bases, (base): [Token, Token][] => bases.map((otherBase) => [base, otherBase])).filter(
        ([t0, t1]) => t0.address !== t1.address
      ),
    [bases]
  )

  const allPairCombinations: [Token, Token][] = useMemo(
    () =>
      tokenA && tokenB
        ? [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            // token B against all bases
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            // each base against all bases
            ...basePairs,
          ]
            .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
        : [],
    [tokenA, tokenB, bases, basePairs]
  )

  const allPairs = useV2Pairs(pairs, allPairCombinations)
  const anyPairLoading = allPairs.some(([pairState]) => pairState === PairState.LOADING)

  // only pass along valid pairs, non-duplicated pairs
  return [
    useMemo(
      () =>
        Object.values(
          allPairs
            // filter out invalid pairs
            .filter((result): result is [PairState.EXISTS, Pair] =>
              Boolean(result[0] === PairState.EXISTS && result[1])
            )
            // filter out duplicated pairs
            .reduce<{ [pairAddress: string]: Pair }>((memo, [, curr]) => {
              memo[curr.liquidityToken.address] = memo[curr.liquidityToken.address] ?? curr
              return memo
            }, {})
        ),
      [allPairs]
    ),
    anyPairLoading,
  ]
}

export function useTradeExactIn(
  allPairs: string[] | [],
  currencyAmountIn?: CurrencyAmount<Currency>,
  currencyOut?: Currency
): any {
  const [allowedPairs, pairLoading] = useAllCommonPairs(allPairs, currencyAmountIn?.currency, currencyOut)

  return [
    useMemo(() => {
      if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
        const trade =
          Trade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: 2, maxNumResults: 1 })[0] ??
          null

        return trade
      }
      return null
    }, [allowedPairs, currencyAmountIn, currencyOut]),
    pairLoading || allowedPairs.length === 0,
  ]
}

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(
  allPairs: string[] | [],
  currencyIn?: Currency,
  currencyAmountOut?: CurrencyAmount<Currency>
): any {
  const [allowedPairs, pairLoading] = useAllCommonPairs(allPairs, currencyIn, currencyAmountOut?.currency)

  return [
    useMemo(() => {
      if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
        return (
          Trade.bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, { maxHops: 2, maxNumResults: 1 })[0] ??
          null
        )
      }
      return null
    }, [allowedPairs, currencyIn, currencyAmountOut]),
    pairLoading || allowedPairs.length === 0,
  ]
}
