export default function formatBalance(balance: any) {
  const formattedNumber = parseFloat(balance)
    .toFixed(6)
    .replace(/(\.[0-9]*[1-9])0+$|\.0*$/, '$1')
  const parsedNumber = parseFloat(formattedNumber)

  // Check if the parsed number is zero
  return parsedNumber === 0 ? parsedNumber.toFixed(0) : parsedNumber
}
