import { Currency, CurrencyAmount, Fraction, Percent } from '@vnaysn/jediswap-sdk-core'
import JSBI from 'jsbi'

const ONE = new Fraction(1, 1)

export function calculateSlippageAmount(value: CurrencyAmount<Currency>, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }  return [value.multiply(ONE.subtract(slippage)).quotient, value.multiply(ONE.add(slippage)).quotient]
}


