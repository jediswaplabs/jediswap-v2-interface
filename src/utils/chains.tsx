import { getChainInfo, NetworkType } from 'constants/chainInfo'
import { ChainId } from '@vnaysn/jediswap-sdk-core'

export function isL2ChainId(chainId: ChainId | undefined): chainId is ChainId {
  const chainInfo = getChainInfo(chainId)
  return chainInfo?.networkType === NetworkType.L2
}
