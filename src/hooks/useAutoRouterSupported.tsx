import { useAccountDetails } from 'hooks/starknet-react'
import { isSupportedChain } from 'constants/chains'

export default function useAutoRouterSupported(): boolean {
  const { chainId } = useAccountDetails()
  return isSupportedChain(chainId)
}
