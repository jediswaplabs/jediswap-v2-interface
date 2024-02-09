import { useAccountDetails } from 'hooks/starknet-react'
import { SUPPORTED_V2POOL_CHAIN_IDS } from 'constants/chains'

export function useNetworkSupportsV2() {
  const { chainId } = useAccountDetails()
  return chainId && SUPPORTED_V2POOL_CHAIN_IDS.includes(chainId)
}
