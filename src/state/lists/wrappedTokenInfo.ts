import { ChainId, Token } from '@jediswap/sdk'
import { Tags, TokenInfo } from '@jediswap/token-lists'

import { isAddress } from '../../utils'

type TagDetails = Tags[keyof Tags]
interface TagInfo extends TagDetails {
  id: string
}
/**
 * Token instances created from token info on a token list.
 */
export class WrappedTokenInfo extends Token {
  public readonly tokenInfo: TokenInfo
  public readonly tags: TagInfo[]
  constructor(tokenInfo: TokenInfo, tags: TagInfo[]) {
    super(
      tokenInfo.chainId as ChainId,
      tokenInfo.address,
      tokenInfo.decimals,
      tokenInfo.symbol,
      tokenInfo.name,
      tokenInfo.logoURI
    )
    this.tokenInfo = tokenInfo
    this.tags = tags
  }
}
