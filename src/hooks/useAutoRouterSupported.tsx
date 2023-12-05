import { useWeb3React } from '@web3-react/core'
import { isSupportedChain } from 'constants/chains'

export default function useAutoRouterSupported(): boolean {
  const { chainId } = useAccountDetails()
  return isSupportedChain(chainId)
}
