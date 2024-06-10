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
import { Currency, CurrencyAmount, Token } from '@vnaysn/jediswap-sdk-core'
import { removeExtraDecimals } from 'utils/removeExtraDecimals'
import { Trans } from '@lingui/macro'
import { formatUnits } from 'ethers/lib/utils'
import { useSelector } from 'react-redux'
import { AppState } from 'state/reducer'
interface TokenData {
  [key: string]: any
}

export function useFeeConfig(vaultAddress: string | undefined) {
  const { chainId } = useAccountDetails()

  const fee = useQuery({
    queryKey: [`fee_config/${vaultAddress}/${chainId}`],
    queryFn: async () => {
      if (!vaultAddress) return
      const provider = providerInstance(chainId ?? DEFAULT_CHAIN_ID)
      const results = await provider.callContract({
        entrypoint: 'fee_config',
        contractAddress: vaultAddress,
      })
      return results?.result
    },
  })

  return fee.data ? fee.data : 0
}

function calcWithdrawToken(
  shareTokenAmount: bigint | undefined,
  shareTokenTotalSupply: any,
  tokenAll: any,
  currency: Currency | undefined
) {
  if (!shareTokenAmount || !shareTokenTotalSupply || !tokenAll || !currency) {
    return undefined
  }
  const tokenAmount =
    shareTokenAmount && tokenAll && shareTokenTotalSupply
      ? (shareTokenAmount * tokenAll) / (shareTokenTotalSupply as bigint)
      : 0
  return CurrencyAmount.fromRawAmount(currency, tokenAmount.toString())
}

export function useUserShares(
  vaultAddress: string | undefined,
  state: VaultState | null,
  currencyA: Currency | undefined,
  currencyB: Currency | undefined
): {
  token0: any
  token1: any
  totalToken0Amount: CurrencyAmount<Currency> | undefined
  totalToken1Amount: CurrencyAmount<Currency> | undefined
  totalShares: any
  withdrawError: any
  insufficientBalance: boolean
} {
  const { address } = useAccountDetails()
  const chainId = useSelector((state: AppState) => state.vaults.chainId)
  const shares = useQuery({
    queryKey: [`balance_of/${address}/${vaultAddress}/${chainId}`],
    queryFn: async () => {
      if (!address || !chainId || !vaultAddress) return
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

  const withdrawTypedValue = state ? state.withdrawTypedValue : '0'
  const typedValue: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(
    withdrawTypedValue,
    new Token(DEFAULT_CHAIN_ID, '', 18)
  )
  const typedValueBigInt = typedValue ? BigInt(typedValue.raw.toString()) : undefined
  const { data, isError } = useUnderlyingVaultAssets(vaultAddress)

  const { token0All, token1All } = useMemo(() => {
    const result: any = data
    if (!result || isError || !result[0] || !result[1]) return { token0All: undefined, token1All: undefined }
    return {
      token0All: result[0],
      token1All: result[1],
    }
  }, [data, isError])

  const { data: supply, isError: supplyError } = useVaultTotalSupply(vaultAddress)

  const { totalSupply } = useMemo(() => {
    if (!supply || supplyError) return { totalSupply: undefined }
    return {
      totalSupply: supply,
    }
  }, [supply, supplyError])

  //amount of token that the user gets for a given amount of share token after withdrawal
  const token0 = calcWithdrawToken(typedValueBigInt, totalSupply, token0All, currencyA)
  const token1 = calcWithdrawToken(typedValueBigInt, totalSupply, token1All, currencyB)

  //total available amount if a user withdraws 100%
  const totalToken0Amount = calcWithdrawToken(shares?.data, totalSupply, token0All, currencyA)
  const totalToken1Amount = calcWithdrawToken(shares?.data, totalSupply, token1All, currencyB)

  const formattedShares = formatUnits(totalShares ?? 0)
  let insufficientBalance = false
  const withdrawError = useMemo(() => {
    let error: ReactNode | undefined

    if (!typedValue) {
      error = error ?? <Trans>Enter an amount</Trans>
    }
    if (typedValue && Number(formattedShares) < Number(withdrawTypedValue)) {
      insufficientBalance = true
      error = error ?? <Trans>Insufficient balance</Trans>
    }
    return error
  }, [typedValue, formattedShares])
  return {
    token0,
    token1,
    totalToken0Amount,
    totalToken1Amount,
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
