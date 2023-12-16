import { CurrencyAmount, Percent, Token } from '@vnaysn/jediswap-sdk-core'
import { useMemo } from 'react'
import { InterfaceTrade } from 'state/routing/types'

export function useMaxAmountIn(trade: InterfaceTrade | undefined, allowedSlippage: number) {
  return useMemo(() => {
    const maximumAmountIn = trade?.maximumAmountIn(allowedSlippage as any) 
    return maximumAmountIn?.currency.isToken ? (maximumAmountIn as CurrencyAmount<Token>) : undefined
  }, [allowedSlippage, trade])
}
