import { Contract } from 'starknet'
import { useMemo } from 'react'
import ERC20_ABI from '../constants/abis/erc20.json'
import PAIR_ABI from '../constants/abis/Pair.json'
import { MULTICALL_NETWORKS, MULTICALL_ABI } from '../constants/contracts/multicall'
import { FACTORY_ADDRESS, FACTORY_ABI } from '../constants/contracts/factoryAddress'
import { ROUTER_ADDRESS, ROUTER_ABI } from '../constants/contracts/routerAddress'
import { ZAP_IN_ADDRESS, ZAP_IN_ABI } from '../constants/contracts/zapInAddress'
import { DEFAULT_CHAIN_ID } from 'constants/tokens'
import { useAccountDetails, useConnectors } from './starknet-react'
import { Connector } from '@starknet-react/core'
import { getContract } from 'utils'
import { ChainId } from '@jediswap/sdk'

// returns null on errors
function useContract(address: string | undefined, ABI: any, withSignerIfPossible = true): Contract | null {
  const { account, chainId, connector } = useAccountDetails()
  return useMemo(() => {
    if (!address || !ABI || !account) return null

    try {
      const contract = getContract(address, ABI, account, connector as Connector) //line 26
      return contract
    } catch (error) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [address, ABI, account, connector, chainId])
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function usePairContract(pairAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(pairAddress, PAIR_ABI, withSignerIfPossible)
}
//Change here
export function useFactoryContract(): Contract | null {
  const { account, chainId } = useAccountDetails()

  return useContract(FACTORY_ADDRESS[(chainId as ChainId) ?? DEFAULT_CHAIN_ID], FACTORY_ABI, true)
}
//Change Here
export function useRouterContract(): Contract | null {
  const { account, chainId } = useAccountDetails()

  return useContract(ROUTER_ADDRESS[(chainId as ChainId) ?? DEFAULT_CHAIN_ID], ROUTER_ABI, true)
}

export function useMulticallContract(): Contract | null {
  const { account, chainId } = useAccountDetails()

  return useContract(MULTICALL_NETWORKS[(chainId as ChainId) ?? DEFAULT_CHAIN_ID], MULTICALL_ABI, false)
}
//Change Here
export function useZapInContract(): Contract | null {
  const { account, chainId } = useAccountDetails()

  return useContract(ZAP_IN_ADDRESS[(chainId as ChainId) ?? DEFAULT_CHAIN_ID], ZAP_IN_ABI, true)
}
