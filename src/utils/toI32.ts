import { BigNumberish } from 'starknet'

interface I32 {
  mag: string
  sign: number // 0 for positive, 1 for negative
}

const INT_32_MAX = 2n ** 31n - 1n // Maximum positive value for i32
const INT_32_MIN = -(2n ** 31n) // Minimum value for i32

export const toI32 = (it: BigNumberish): I32 => {
  const bn = BigInt(it)

  if (bn > INT_32_MAX || bn < INT_32_MIN) {
    throw new Error('Number is out of range for i32')
  }

  const sign = bn < 0n ? 1 : 0
  const mag = (bn >= 0n ? bn : -bn).toString(10)

  return { mag, sign }
}
