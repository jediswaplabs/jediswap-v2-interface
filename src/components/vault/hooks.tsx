import { useContractRead } from '@starknet-react/core'
import VAULT_ABI from './abi.json'
import { cairo } from 'starknet'
const vaultAddress = '0x054d911ef2a0c44fc92d28d55fb0abe1f8a93c1c2b3035c0c47d7965a6378da9' //replace vault address

interface TokenData {
  [key: string]: any
}

export const useTotalSharesSupply = () => {
  const { data, isLoading, isError } = useContractRead({
    functionName: 'total_supply',
    args: [],
    abi: VAULT_ABI,
    address: vaultAddress,
    watch: true,
  })

  return { data, isLoading, isError }
}

export const useUnderlyingVaultAssets = () => {
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
