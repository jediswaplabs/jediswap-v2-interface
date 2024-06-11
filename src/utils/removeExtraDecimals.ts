import { Currency } from '@vnaysn/jediswap-sdk-core'

export function removeExtraDecimals(number: number, currency: Currency | undefined) {
  const decimals = currency?.decimals
  const numberString = number.toString()
  const decimalPosition = numberString.indexOf('.')
  if (!decimals) {
    return number
  }
  if (decimalPosition !== -1) {
    if (numberString.length - decimalPosition - 1 > decimals) {
      return parseFloat(numberString.slice(0, decimalPosition + decimals + 1))
    }
  }
  return number
}
