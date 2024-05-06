import { num } from 'starknet'

export const toInt = (result: any): number => {
  return result?.sign === true ? -Number(result?.mag) : Number(result?.mag)
}

export const toIntFromHexArray = (result: string[]) => {
  if (!result || !result.length) return
  const mag = num.hexToDecimalString(result[0])
  const sign = num.hexToDecimalString(result[1])
  return Boolean(sign) === true ? -Number(mag) : Number(mag)
}
