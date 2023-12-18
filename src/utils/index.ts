export { isAddress, shortenAddress, checkAddress } from './addresses'
export { escapeRegExp } from './escapeRegExp'
export { getContract } from './getContract'

import { JSBI, Percent } from '@jediswap/sdk'


// converts a basis points value to a sdk percent
export function basisPointsToPercent(num: number): Percent {
    return new Percent(JSBI.BigInt(num), JSBI.BigInt(10000))
  }
