import { useContractRead } from '@starknet-react/core'
import VAULT_ABI from './abi.json'
import { cairo, CallData, num, uint256 } from 'starknet'
import { isError, useQuery } from 'react-query'
import { providerInstance } from 'utils/getLibrary'
import { useAccountDetails } from 'hooks/starknet-react'
import { DEFAULT_CHAIN_ID, WETH } from 'constants/tokens'
import { useMemo } from 'react'
const vaultAddress = '0x033bb35548c9cfcfdafe1c18cf8040644a52881f8fd2f4be56770767c12e3a41' //replace vault address
interface TokenData {
  [key: string]: any
}

export const useUserShares = () => {
  const { address, chainId } = useAccountDetails()
  const shares = useQuery({
    queryKey: [`balance_of/${address}/${vaultAddress}/${chainId}`],
    queryFn: async () => {
      if (!address || !chainId) return
      const provider = providerInstance(chainId ?? DEFAULT_CHAIN_ID)
      const results = await provider.callContract({
        entrypoint: 'balance_of',
        contractAddress: vaultAddress,
        calldata: CallData.compile({
          address,
        }),
      })
      return num.toBigInt(results?.result?.[0])
    },
  })

  const { data, isError } = useUnderlyingVaultAssets(vaultAddress)
  const { token0All, token1All, priceRatio } = useMemo(() => {
    const result: any = data
    if (!result || isError) return { token0All: undefined, token1All: undefined, priceRatio: undefined }
    return {
      token0All: result[0],
      token1All: result[1],
      priceRatio: result[0] / result[1],
    }
  }, [data, isError])

  const { data: supply, isError: supplyError } = useVaultTotalSupply(vaultAddress)

  const { totalSupply } = useMemo(() => {
    if (!supply || supplyError) return { totalSupply: undefined }
    return {
      totalSupply: supply,
    }
  }, [supply, supplyError])

  const token0 = shares.data && token0All && totalSupply ? (shares.data * token0All) / (totalSupply as bigint) : 0

  const token1 = token0 && priceRatio ? token0 / BigInt(priceRatio) : 0

  return {
    token0,
    token1,
    shares: shares.data,
  }
}

export const useUnderlyingVaultAssets = (vaultAddress: string) => {
  const { data, isLoading, isError } = useContractRead({
    functionName: 'vault_all_underlying_assets',
    args: [],
    abi: VAULT_ABI,
    address: vaultAddress,
    watch: true,
  })
  return { data, isLoading, isError }
}

export const useVaultTotalSupply = (vaultAddress: string) => {
  const { data, isLoading, isError } = useContractRead({
    functionName: 'total_supply',
    args: [],
    abi: VAULT_ABI,
    address: vaultAddress,
    watch: true,
  })

  return { data, isLoading, isError }
}
