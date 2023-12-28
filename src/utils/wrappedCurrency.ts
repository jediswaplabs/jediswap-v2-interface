// @ts-nocheck
import { ChainId, Currency, CurrencyAmount, Token, TokenAmount } from '@vnaysn/jediswap-sdk-core'
import { ETHER, WETH } from '@jediswap/sdk'

export function wrappedCurrency(currency: Currency | undefined, chainId: ChainId): Token | undefined {
  return chainId && currency === ETHER ? WETH[chainId] : currency?.wrapped ? currency : undefined
}

export function wrappedCurrencyAmount(
  currencyAmount: CurrencyAmount<any> | undefined,
  chainId: ChainId | undefined
): TokenAmount | undefined {
  const token = currencyAmount && chainId ? wrappedCurrency(currencyAmount.currency, chainId) : undefined
  return token && currencyAmount ? new TokenAmount(token, currencyAmount.raw) : undefined
}
