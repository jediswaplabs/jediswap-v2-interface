import { Currency, CurrencyAmount, Fraction, ONE, Percent } from '@vnaysn/jediswap-sdk-core'

export function calculateMaximumAmountWithSlippage(amount: CurrencyAmount<Currency>, slippageTolerance: Percent) {
  const slippageAdjustedAmount = new Fraction(ONE).add(slippageTolerance).multiply(amount.quotient).quotient
  return CurrencyAmount.fromRawAmount(amount.currency, slippageAdjustedAmount)
}
