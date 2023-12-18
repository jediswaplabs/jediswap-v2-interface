import { Currency } from '@vnaysn/jediswap-sdk-core'
import { useMemo } from 'react'

// import { useUnsupportedTokens } from './Tokens'

/**
 * Returns true if the input currency or output currency cannot be traded in the interface
 * @param currencyIn the input currency to check
 * @param currencyOut the output currency to check
 */
export function useIsSwapUnsupported(currencyIn?: Currency | null, currencyOut?: Currency | null): boolean {
  return false
}
