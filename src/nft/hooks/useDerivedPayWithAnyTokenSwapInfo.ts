import { Currency, CurrencyAmount, NativeCurrency, Percent, Token, TradeType } from '@vnaysn/jediswap-sdk-core'
import useAutoSlippageTolerance from 'hooks/useAutoSlippageTolerance'
import { useDebouncedTrade } from 'hooks/useDebouncedTrade'
import { useMemo } from 'react'
import { ClassicTrade, RouterPreference, TradeState } from 'state/routing/types'
import { isClassicTrade } from 'state/routing/utils'

export default function useDerivedPayWithAnyTokenSwapInfo(
  inputCurrency?: Currency,
  parsedOutputAmount?: CurrencyAmount<NativeCurrency | Token>
): {
  state: TradeState
  trade?: ClassicTrade
  maximumAmountIn?: CurrencyAmount<Token>
  allowedSlippage: Percent
} {
  const { state } = useDebouncedTrade(
    TradeType.EXACT_OUTPUT,
    parsedOutputAmount,
    inputCurrency ?? undefined,
    RouterPreference.API
  )

  const allowedSlippage = new Percent(10)
  const maximumAmountIn = useMemo(() => {
    // const maximumAmountIn = trade?.maximumAmountIn(allowedSlippage)
    return undefined
  }, [])

  return useMemo(() => {
    return {
      state,

      maximumAmountIn,
      allowedSlippage,
    }
  }, [allowedSlippage, maximumAmountIn, state])
}
