import { useContractRead } from '@starknet-react/core'
import { cairo } from 'starknet'

import VAULT_ABI from './abi.json'

interface TokenData {
  [key: string]: any
}

export const useTotalSharesSupply = (vaultAddress: string) => {
  const { data, isLoading, isError } = useContractRead({
    functionName: 'total_supply',
    args: [],
    abi: VAULT_ABI,
    address: vaultAddress,
    watch: true,
  })

  return { data, isLoading, isError }
}

export const useUnderlyingVaultAssets = (vaultAddress: string) => {
  // neeed to pass on the correct contract address later on
  const { data, isLoading, isError } = useContractRead({
    functionName: 'vault_all_underlying_assets',
    args: [],
    abi: VAULT_ABI,
    address: vaultAddress,
    watch: true,
  })

  //   if (!data || typeof data !== 'object') return undefined
  // //   const tokenQuantities: any = data
  // //   const token0 = tokenQuantities?.['0']
  // //   const token1 = tokenQuantities?.['1']

  // //   console.log(cairo.uint256(token0), token1, 'token0')

  return { data, isLoading, isError }
}

export const useVaultTotalSupply = (vaultAddress: string) => {
  // neeed to pass on the correct contract address later on
  const { data, isLoading, isError } = useContractRead({
    functionName: 'total_supply',
    args: [],
    abi: VAULT_ABI,
    address: vaultAddress,
    watch: true,
  })

  //   if (!data || typeof data !== 'object') return undefined
  // //   const tokenQuantities: any = data
  // //   const token0 = tokenQuantities?.['0']
  // //   const token1 = tokenQuantities?.['1']

  // //   console.log(cairo.uint256(token0), token1, 'token0')

  return { data, isLoading, isError }
}
