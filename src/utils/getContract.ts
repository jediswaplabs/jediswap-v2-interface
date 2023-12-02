// import { BigNumberish } from 'starknet/dist/utils/number'
import { validateAndParseAddress, Abi, uint256, Contract, AccountInterface, BigNumberish } from 'starknet'
import { ZERO_ADDRESS } from '../constants'
import { JSBI, Percent, Token, CurrencyAmount, Currency, ETHER } from '@jediswap/sdk'
import { LPTokenAddressMap, TokenAddressMap } from '../state/lists/hooks'
import isZero from './isZero'
import { Connector } from '@starknet-react/core'

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(addr: string | null | undefined): string | false {
  try {
    if (addr && !isZero(addr)) {
      return validateAndParseAddress(addr)
    }
    return false
  } catch {
    return false
  }
}

// account is optional
export function getContract(
  address: string,
  ABI: any,
  library: AccountInterface,
  connector?: Connector,
  account?: string
): Contract {
  const parsedAddress = isAddress(address)

  if (!parsedAddress || parsedAddress === ZERO_ADDRESS) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }

  // const providerOrSigner = getProviderOrSigner(library, connector, account)

  return new Contract(ABI as Abi, address, library)
}

// account is optional
// export function getRouterContract(_: number, library: any, account?: string): Contract {
//   return getContract(ROUTER_ADDRESS[chainId ?? DEFAULT_CHAIN_ID], JediSwapRouterABI, library, account)
// }

export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
}

export function isTokenOnList(defaultTokens: TokenAddressMap | LPTokenAddressMap, currency?: Currency): boolean {
  if (currency === ETHER) return true
  return Boolean(currency instanceof Token && defaultTokens[currency.chainId]?.[currency.address])
}

export function calculateSlippageAmount(value: CurrencyAmount, slippage: number): [JSBI, JSBI] {
  if (slippage < 0 || slippage > 10000) {
    throw Error(`Unexpected slippage value: ${slippage}`)
  }
  return [
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 - slippage)), JSBI.BigInt(10000)),
    JSBI.divide(JSBI.multiply(value.raw, JSBI.BigInt(10000 + slippage)), JSBI.BigInt(10000)),
  ]
}

export const parsedAmountToUint256Args = (amount: JSBI): { [k: string]: BigNumberish; type: 'struct' } => {
  return { type: 'struct', ...uint256.bnToUint256(amount.toString()) }
}
