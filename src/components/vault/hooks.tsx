import { useContractRead } from '@starknet-react/core'
import VAULT_ABI from './abi.json'
import { cairo, CallData, num, uint256 } from 'starknet'
import { isError, useQuery } from 'react-query'
import { providerInstance } from 'utils/getLibrary'
import { useAccountDetails } from 'hooks/starknet-react'
import { DEFAULT_CHAIN_ID, WETH } from 'constants/tokens'
import { ReactNode, useMemo } from 'react'
import { VaultState } from 'state/vaults/reducer'
import { useParams } from 'react-router-dom'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { Currency, CurrencyAmount } from '@vnaysn/jediswap-sdk-core'
import { removeExtraDecimals } from 'utils/removeExtraDecimals'
import { Trans } from '@lingui/macro'
const vaultAddress = '0x033bb35548c9cfcfdafe1c18cf8040644a52881f8fd2f4be56770767c12e3a41' //replace vault address
interface TokenData {
  [key: string]: any
}

export function useUserShares(
  state: VaultState,
  currencyA: Currency | undefined,
  currencyB: Currency | undefined
): {
  token0: any
  token1: any
  totalShares: any
  withdrawError: any
  insufficientBalance: boolean
} {
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

  const totalShares = shares.data

  const withdrawTypedValue = state.withdrawTypedValue
  const { vaultId: vaultAddressFromUrl } = useParams
  const typedValue: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(withdrawTypedValue, currencyA)
  const { data, isError } = useUnderlyingVaultAssets(vaultAddressFromUrl ? vaultAddressFromUrl : '')

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
  {
    /*   const token0 =
    withdrawTypedValue && token0All && totalSupply
      ? (Number(withdrawTypedValue) * token0All) / (totalSupply as bigint)
      : 0
    */
  }

  const token0: CurrencyAmount<Currency> | undefined = useMemo(() => {
    if (!typedValue || !totalSupply || !token0All) {
      return undefined
    }
    const token0Amount = Number(withdrawTypedValue) * (Number(token0All) / Number(totalSupply))

    const formattedToken0 = removeExtraDecimals(Number(token0Amount), currencyA)
    return tryParseCurrencyAmount(formattedToken0.toString(), currencyA)
  }, [typedValue, totalSupply, token0All])

  const token1: CurrencyAmount<Currency> | undefined = useMemo(() => {
    if (!typedValue || !totalSupply || !token1All) {
      return undefined
    }
    const token1Amount = Number(withdrawTypedValue) * (Number(token1All) / Number(totalSupply))
    const formattedToken1 = removeExtraDecimals(Number(token1Amount), currencyB)
    return tryParseCurrencyAmount(formattedToken1.toString(), currencyB)
  }, [typedValue, totalSupply, token1All])
  //   const token1 = token0 && priceRatio ? token0 / BigInt(priceRatio) : 0

  const sharesInDecimals = Number(totalShares?.toString()) / 10 ** 18

  let insufficientBalance = false
  const withdrawError = useMemo(() => {
    let error: ReactNode | undefined

    if (!typedValue) {
      error = error ?? <Trans>Enter an amount</Trans>
    }
    if (typedValue && sharesInDecimals < Number(withdrawTypedValue)) {
      insufficientBalance = true
      error = error ?? <Trans>Insufficient balance</Trans>
    }
    return error
  }, [typedValue, sharesInDecimals])
  return {
    token0,
    token1,
    totalShares,
    withdrawError,
    insufficientBalance,
  }
}

export const useUnderlyingVaultAssets = (vaultAddress: string | undefined) => {
  if (!vaultAddress) {
    return { data: null, isLoading: false, isError: false }
  }
  const { data, isLoading, isError } = useContractRead({
    functionName: 'vault_all_underlying_assets',
    args: [],
    abi: VAULT_ABI,
    address: vaultAddress,
    watch: true,
  })
  return { data, isLoading, isError }
}

export const useVaultTotalSupply = (vaultAddress: string | undefined) => {
  if (!vaultAddress) {
    return { data: null, isLoading: false, isError: false }
  }
  const { data, isLoading, isError } = useContractRead({
    functionName: 'total_supply',
    args: [],
    abi: VAULT_ABI,
    address: vaultAddress,
    watch: true,
  })

  return { data, isLoading, isError }
}
