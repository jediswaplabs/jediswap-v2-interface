import { Contract } from 'starknet'
import { useMemo } from 'react'
import { FACTORY_ADDRESS, FACTORY_ABI } from 'contracts/factoryAddress'
import { useAccountDetails } from './starknet-react'
import { DEFAULT_CHAIN_ID, NONFUNGIBLE_POOL_MANAGER_ADDRESS } from 'constants/tokens'
import { getContractV2 } from 'utils/getContract'
import { MULTICALL_ABI, MULTICALL_NETWORKS } from 'contracts/multicall'
import { NonfungiblePositionManager } from '@vnaysn/jediswap-sdk-v3'
import NFTPositionManagerABI from 'contracts/nonfungiblepositionmanager/abi.json'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { account, chainId, connector } = useAccountDetails()
  return useMemo(() => {
    if (!address || !ABI || !account) return null

    try {
      const contract = getContractV2(address, ABI, account, connector) //line 26
      return contract
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, account, connector, chainId])
}

// export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
//   return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
// }

// export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
//   return useContract(pairAddress, PAIR_ABI, withSignerIfPossible)
// }
//Change here
export function useFactoryContract(): Contract | null {
  const { account, chainId } = useAccountDetails()

  return useContract(FACTORY_ADDRESS[chainId ?? DEFAULT_CHAIN_ID], FACTORY_ABI, true)
}
//Change Here
// export function useRouterContract(): Contract | null {
//   const { account, chainId } = useAccountDetails()

//   return useContract(ROUTER_ADDRESS[chainId ?? DEFAULT_CHAIN_ID], ROUTER_ABI, true)
// }

export function useMulticallContract(): Contract | null {
  const { account, chainId } = useAccountDetails()

  return useContract(MULTICALL_NETWORKS[chainId ?? DEFAULT_CHAIN_ID], MULTICALL_ABI, false)
}
// //Change Here
// export function useZapInContract(): Contract | null {
//   const { account, chainId } = useAccountDetails()

//   return useContract(ZAP_IN_ADDRESS[chainId ?? DEFAULT_CHAIN_ID], ZAP_IN_ABI, true)
// }

export function useV3NFTPositionManagerContract(withSignerIfPossible?: boolean): NonfungiblePositionManager | null {
  const { address: account, chainId } = useAccountDetails()
  const contract = useContract(NONFUNGIBLE_POOL_MANAGER_ADDRESS, NFTPositionManagerABI, withSignerIfPossible)
  return contract
}
