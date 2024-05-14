export function decimalToBigInt(decimalNumber: number) {
  const decimalString = decimalNumber.toString()
  const decimalPosition = decimalString.indexOf('.')

  if (decimalPosition === -1) {
    return BigInt(decimalNumber)
  }

  const scale = 10 ** (decimalString.length - decimalPosition - 1)

  return BigInt(decimalNumber * scale)
}
