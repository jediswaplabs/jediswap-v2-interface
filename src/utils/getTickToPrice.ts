import { Price, Token } from '@vnaysn/jediswap-sdk-core'
import { tickToPrice } from '@vnaysn/jediswap-sdk-v3'

export function getTickToPrice(baseToken?: Token, quoteToken?: Token, tick?: number): Price<Token, Token> | undefined {
  if (!baseToken || !quoteToken || typeof tick !== 'number') {
    return undefined
  }
  return tickToPrice(baseToken, quoteToken, tick)
}
