import { useDispatch, useSelector } from 'react-redux'
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isEmpty, uniq } from 'lodash'
import { ChainId, Currency, CurrencyAmount, Token } from '@vnaysn/jediswap-sdk-core'
import { useBalance } from '@starknet-react/core'
import { Trans } from '@lingui/macro'
import { useParams } from 'react-router-dom'
import {
  updateAllVaults,
  updateUserVaults,
  updateInput,
  updateWithdrawInput,
  VaultState,
  updateChainId,
} from './reducer'
import { useAppDispatch, useAppSelector } from '../hooks'
import teahouseLogo from '../../assets/vaults/teahouse.svg'
import { useAccountBalance, useAccountDetails } from '../../hooks/starknet-react'
import formatBalance from '../../utils/formatBalance'
import { Field } from './actions'
import { AppDispatch } from 'state'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useUnderlyingVaultAssets, useVaultTotalSupply } from 'components/vault/hooks'
import { useConnectionReady } from 'connection/eagerlyConnect'
import { AppState } from 'state/reducer'
import { DEFAULT_PERMISSIONLESS_API_RESPONSE } from '../../components/vault/constants'
import { formatUsdPrice } from 'nft/utils'
import { removeExtraDecimals } from 'utils/removeExtraDecimals'
import { Vault } from './reducer'
import { DEFAULT_CHAIN_ID, TEAHOUSE_LOGO_URI, vaultURL } from 'constants/tokens'

type Maybe<T> = T | null | undefined

interface VaultTotalSupply {
  totalSupply: number
}

type VaultAssetsData = [bigint, bigint]

interface VaultAssets {
  token0All: number
  token1All: number
}

export function useVaultState(): AppState['vaults'] {
  return useAppSelector((state) => state.vaults)
}

const getTeaHouseLogoUriPath = (iconName = '') => (iconName ? `${TEAHOUSE_LOGO_URI}/${iconName}` : null)
const getVaultListWithContents = async (
  chainId: ChainId | undefined
): Promise<{ [key: string]: Vault } | undefined> => {
  const endpoint = vaultURL('content', chainId ?? DEFAULT_CHAIN_ID)
  const result: { [key: string]: Vault } = {}
  const response = await fetch(endpoint)
  const { vaults } = (await response.json()) ?? {}
  if (!vaults) {
    return
  }
  const filteredVaults = vaults
    .filter((vault: Vault) => vault.isActive)
    .filter((vault: Vault) => vault.protocol === 'jediswap')
  // .filter((vault) => vault.chain === 'arbitrum')
  for (const vault of filteredVaults) {
    const shareAddress = vault.share?.address
    const data: Partial<Vault> = {}
    const token0 = vault.assets?.[0] ?? null
    const token1 = vault.assets?.[1] ?? null
    if (!shareAddress) {
      continue
    }
    if (!(token0 && token1)) {
      continue
    }

    data.token0 = {
      ...token0,
      logoURI: getTeaHouseLogoUriPath(token0?.icon),
      name: token0.symbol,
    }

    data.token1 = {
      ...token1,
      logoURI: getTeaHouseLogoUriPath(token1?.icon),
      name: token1.symbol,
    }

    data.poolAddress = vault.poolAddress
    data.defaultSlippage = vault.defaultSlippage
    data.details = vault.details
    data.feeTier = vault.feeTier
    data.mainAssetKey = `token${vault.mainAssetIndex}`
    data.links = vault.links
    data.name = vault.name
    data.positionGraph = vault.positionGraph
    data.riskLevel = vault.riskLevel
    data.share = vault.share
    data.strategyType = vault.strategyType
    data.lpStrategyGraph = vault.lpStrategyGraph
    data.type = vault.type
    data.chainId = ChainId.MAINNET
    data.provider = {
      name: 'Teahouse',
      logo: teahouseLogo,
    }
    result[shareAddress] = data as Vault
  }
  return result
}

const getPermissionlessVaultDataList = async (chainId: ChainId | undefined) => {
  const endpoint = vaultURL('permissionless', chainId ?? DEFAULT_CHAIN_ID)
  const result: { [key: string]: Vault } = {}
  const response = await fetch(endpoint)
  const { vaults } = (await response.json()) ?? {}
  if (!vaults) {
    return
  }
  for (const vault of vaults) {
    const { address } = vault
    const data: Partial<Vault> = {}
    const token0 = vault.latestInfo?.token0 ?? null
    const token1 = vault.latestInfo?.token1 ?? null
    if (!address) {
      continue
    }
    if (!(token0 || token1)) {
      continue
    }

    data.token0 = token0
    data.token1 = token1

    result[address] = data as Vault
  }
  return result
}

const getTokenPrices = async (contracts: string[]) => {
  // TODO VAULTS: replace with the real price fetching logic
  const result = Object.fromEntries(contracts.map((address: string) => [address, 1]))
  return result
}

export function useAllVaults() {
  const allVaults = useSelector((state: AppState) => state.vaults.allVaults)
  const dispatch = useAppDispatch()
  const { chainId: chainIdConnected } = useAccountDetails()
  const chainId = chainIdConnected || DEFAULT_CHAIN_ID
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false
    const loadData = async () => {
      setError(null)
      setIsLoading(true)
      try {
        const [vaultListWithContents, permissionlessVaultDataList] = await Promise.all([
          getVaultListWithContents(chainId),
          getPermissionlessVaultDataList(chainId),
        ])
        if (!vaultListWithContents || !permissionlessVaultDataList) {
          throw new Error('Failed to fetch data')
        }
        const addresses = Object.keys(vaultListWithContents)
        const tokensAddresses = uniq(
          addresses
            .flatMap((address) => [
              vaultListWithContents[address]?.token0?.address,
              vaultListWithContents[address]?.token1?.address,
            ])
            .filter(Boolean)
        )
        const prices = await getTokenPrices(tokensAddresses)
        const combinedData = addresses.reduce((acc: any, address) => {
          if (!permissionlessVaultDataList[address]) {
            return acc
          }
          const token0Address = vaultListWithContents[address]?.token0?.address
          const token1Address = vaultListWithContents[address]?.token1?.address
          acc[address] = {
            ...vaultListWithContents[address],
            performance: {
              ...permissionlessVaultDataList[address],
            },
            prices: {
              token0: prices?.[token0Address] ?? null,
              token1: prices?.[token1Address] ?? null,
            },
          }
          return acc
        }, {})
        if (!ignore) {
          dispatch(updateAllVaults(combinedData))
          dispatch(updateChainId(chainId))
          setIsLoading(false)
        }
      } catch (e) {
        if (!ignore) {
          console.error(e)
          setError('Error while loading vaults')
          setIsLoading(false)
        }
      }
    }
    loadData()
    return () => {
      ignore = true
    }
  }, [chainId])

  return { data: allVaults, error, isLoading, chainId }
}

export function useVaultActionHandlers(): {
  onFieldAInput: (typedValue: string) => void
  onFieldBInput: (typedValue: string) => void
  onWithdrawInput: (typedValue: string) => void
} {
  const dispatch = useDispatch<AppDispatch>()

  const onFieldAInput = useCallback(
    (typedValue: string) => {
      dispatch(updateInput({ field: Field.CURRENCY_A, typedValue }))
    },
    [dispatch]
  )
  const onFieldBInput = useCallback(
    (typedValue: string) => {
      dispatch(updateInput({ field: Field.CURRENCY_B, typedValue }))
    },
    [dispatch]
  )
  const onWithdrawInput = useCallback(
    (typedValue: string) => {
      dispatch(updateWithdrawInput({ field: Field.CURRENCY_B, typedValue }))
    },
    [dispatch]
  )

  return {
    onFieldAInput,
    onFieldBInput,
    onWithdrawInput,
  }
}

export function useVaultDerivedInfo(
  state: any,
  currencyA: Currency | undefined,
  currencyB: Currency | undefined
): {
  dependentField: Field
  currencies: { [field in Field]?: Currency }
  parsedAmounts: { [field in Field]?: CurrencyAmount<Currency> }
  inputError: any
  insufficientBalance: any
  token0All: any
  totalSupply: any
} {
  const { address: account } = useAccountDetails()
  const { independentField, typedValue } = useVaultState()
  const { vaultId: vaultAddressFromUrl } = useParams()

  const { data, isLoading, isError } = useUnderlyingVaultAssets(vaultAddressFromUrl)
  let token0All = BigInt(0)
  let token1All = BigInt(0)
  let priceRatio = 1

  if (data && !isLoading && !isError) {
    const vaultData = data as VaultAssetsData // Type assertion
    token0All = vaultData[0]
    token1All = vaultData[1]
    priceRatio = Number(token1All) / Number(token0All) // get clarity if need to add token decimals here
  }
  const { data: totalSupply, isLoading: isLoading2, isError: isError2 } = useVaultTotalSupply(vaultAddressFromUrl)
  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A

  // tokens
  const currencies: { [field in Field]?: Currency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA ?? undefined,
      [Field.CURRENCY_B]: currencyB ?? undefined,
    }),
    [currencyA, currencyB]
  )

  const { balance: balance1 } = useAccountBalance(currencies[Field.CURRENCY_A])
  const { balance: balance2 } = useAccountBalance(currencies[Field.CURRENCY_B])
  const currencyBalances: any = {
    ...(Field.CURRENCY_A && { [Field.CURRENCY_A]: balance1 }),
    ...(Field.CURRENCY_B && { [Field.CURRENCY_B]: balance2 }),
  }
  let insufficientBalance = false
  // amounts
  const independentAmount: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(
    typedValue,
    currencies[independentField]
  )

  const dependentAmount: CurrencyAmount<Currency> | undefined = useMemo(() => {
    if (independentAmount && priceRatio) {
      const dependentTokenAmount =
        independentAmount.toExact() && token1All && token0All
          ? dependentField === Field.CURRENCY_B
            ? (BigInt(independentAmount.raw.toString()) * token1All) / token0All
            : (BigInt(independentAmount.raw.toString()) * token0All) / token1All
          : 0
      const dependentCurrency = currencies[dependentField]
      if (!dependentCurrency) {
        return undefined
      }
      return CurrencyAmount.fromRawAmount(dependentCurrency, dependentTokenAmount.toString())
    }
    return undefined
  }, [currencies, dependentField, independentAmount, independentField, priceRatio])

  const parsedAmounts: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(
    () => ({
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
    }),
    [dependentAmount, independentAmount, independentField]
  )
  const connectionReady = useConnectionReady()
  const inputError = useMemo(() => {
    let error: ReactNode | undefined

    const { [Field.CURRENCY_A]: parsedAmountA, [Field.CURRENCY_B]: parsedAmountB } = parsedAmounts
    const currencyAAmount = parsedAmountA?.toSignificant() // check - apply proper decimal value
    const currencyBAmount = parsedAmountB?.toSignificant() // check - same

    if (!currencyAAmount || !currencyBAmount) {
      error = error ?? <Trans>Enter an amount</Trans>
    }

    if (currencyAAmount && currencyBalances?.[Field.CURRENCY_A] < currencyAAmount) {
      insufficientBalance = true
      error = error ?? <Trans>Insufficient {currencies[Field.CURRENCY_A]?.symbol} balance</Trans>
    }
    if (currencyBAmount && currencyBalances?.[Field.CURRENCY_B] < currencyBAmount) {
      insufficientBalance = true
      error = error ?? <Trans>Insufficient {currencies[Field.CURRENCY_B]?.symbol} balance</Trans>
    }
    return error
  }, [account, currencies, currencyBalances, connectionReady, parsedAmounts, priceRatio])

  return {
    dependentField,
    currencies,
    parsedAmounts,
    inputError,
    insufficientBalance,
    token0All,
    totalSupply,
  }
}

// export function useVaultWithdrawDerivedInfo(
//   state: VaultState,
//   currencyA: Currency | undefined,
//   currencyB: Currency | undefined
// ): {
//   parsedReceivedTokens: any
//   withdrawError: any
//   insufficientBalance: boolean
// } {
//   const withdrawTypedValue = state.withdrawTypedValue
//   const { vaultId: vaultAddressFromUrl } = useParams()
//   const typedValue: CurrencyAmount<Currency> | undefined = tryParseCurrencyAmount(withdrawTypedValue, currencyA)

//   const { data, isError } = useUnderlyingVaultAssets(vaultAddressFromUrl ? vaultAddressFromUrl : '')

//   const { token0All, token1All } = useMemo(() => {
//     const result: any = data
//     if (!result || isError) return { token0All: undefined, token1All: undefined }
//     return {
//       token0All: result[0],
//       token1All: result[1],
//     }
//   }, [data, isError])

//   const {
//     data: data2,
//     isLoading: isLoading2,
//     isError: isError2,
//   } = useVaultTotalSupply(vaultAddressFromUrl ? vaultAddressFromUrl : '')

//   const totalSupply = useMemo(() => {
//     if (!data2 || isError2 || isLoading2) return null
//     return data2
//   }, [data2, isError2, isLoading2])

//   const receivedToken0: CurrencyAmount<Currency> | undefined = useMemo(() => {
//     if (!typedValue || !totalSupply || !token0All) {
//       return undefined
//     }
//     const token0Amount = Number(withdrawTypedValue) * (Number(token0All) / Number(totalSupply))

//     const formattedToken0 = removeExtraDecimals(Number(token0Amount), currencyA)
//     return tryParseCurrencyAmount(formattedToken0.toString(), currencyA)
//   }, [typedValue, totalSupply, token0All])

//   const receivedToken1: CurrencyAmount<Currency> | undefined = useMemo(() => {
//     if (!typedValue || !totalSupply || !token1All) {
//       return undefined
//     }
//     const token1Amount = Number(withdrawTypedValue) * (Number(token1All) / Number(totalSupply))
//     const formattedToken1 = removeExtraDecimals(Number(token1Amount), currencyB)
//     return tryParseCurrencyAmount(formattedToken1.toString(), currencyB)
//   }, [typedValue, totalSupply, token1All])

//   const parsedReceivedTokens: { [field in Field]: CurrencyAmount<Currency> | undefined } = useMemo(
//     () => ({
//       token0: receivedToken0,
//       token1: receivedToken1,
//     }),
//     [receivedToken0, receivedToken1]
//   )
//   const { shares } = useUserShares()
//   const sharesInDecimals = Number(shares?.toString()) / 10 ** 18

//   let insufficientBalance = false
//   const withdrawError = useMemo(() => {
//     let error: ReactNode | undefined

//     if (!typedValue) {
//       error = error ?? <Trans>Enter an amount</Trans>
//     }
//     if (typedValue && sharesInDecimals < Number(withdrawTypedValue)) {
//       insufficientBalance = true
//       error = error ?? <Trans>Insufficient balance</Trans>
//     }
//     return error
//   }, [typedValue, sharesInDecimals])
//   return {
//     parsedReceivedTokens,
//     withdrawError,
//     insufficientBalance,
//   }
// }

export function useVaultTokens(vault: any): { token0: any; token1: any } {
  const token0: any = new Token(
    vault?.token0?.chainId,
    vault?.token0?.address,
    vault?.token0?.decimals,
    vault?.token0?.symbol,
    vault?.token0?.name
  )
  token0.logoURI = vault?.token0?.logoURI

  const token1: any = new Token(
    vault?.token1?.chainId,
    vault?.token1?.address,
    vault?.token1?.decimals,
    vault?.token1?.symbol,
    vault?.token1?.name
  )
  token1.logoURI = vault?.token1?.logoURI

  return { token0, token1 }
}

export function useVaultTableContent(
  vault: any,
  vaultAddress?: string
): { token0: Token; token1: Token; tvl: number; apr: number; feeApr: number; totalApr: number } | null {
  const { token0, token1 } = useVaultTokens(vault)
  const shareTokenAddress = vault?.share?.address
  if (!(vault?.token0 && vault?.token1 && shareTokenAddress)) {
    return null
  }

  const performanceData = vault?.performance[vault?.mainAssetKey]

  let tvl = 0
  let apr = 0
  let feeApr = 0
  let totalApr = 0
  let shareTokenPriceUsd = 0

  if (!isEmpty(performanceData)) {
    const mainTokenDecimals = vault[vault.mainAssetKey].decimals
    const tvlInMainToken = performanceData.tvl / 10 ** mainTokenDecimals
    const tokenPrice = vault.prices[vault.mainAssetKey]
    const shareTokenDecimals = vault?.share?.decimals
    const shareTokenPriceInUnits = performanceData.shareTokenPrice / 10 ** (18 + shareTokenDecimals)
    tvl = tvlInMainToken * tokenPrice
    apr = Number(Number(performanceData.shareTokenApr / 10 ** 4)?.toFixed(2))
    feeApr = Number(Number(performanceData.feeApr / 10 ** 4)?.toFixed(2))
    totalApr = Number(Number((performanceData?.shareTokenApr + performanceData?.feeApr) / 10 ** 4)?.toFixed(2))
    shareTokenPriceUsd = shareTokenPriceInUnits * tokenPrice
  }

  //   const balanceInUsd = Number(userBalanceData?.formatted ?? 0) * (shareTokenPriceUsd ?? 0)

  //   let balance
  //   switch (true) {
  //     case !isConnected:
  //     case isUserBalanceError: {
  //       balance = formatUsdPrice(0)
  //       break
  //     }
  //     case isUserBalanceLoading: {
  //       balance = '...'
  //       break
  //     }
  //     case isUserBalanceSuccess: {
  //       balance = formatUsdPrice(balanceInUsd)
  //       break
  //     }
  //     default: {
  //       balance = formatUsdPrice(0)
  //     }
  //   }

  return {
    token0,
    token1,
    tvl: tvl ?? 0,
    apr: apr ? Number(apr) : 0,
    feeApr: feeApr ? Number(feeApr) : 0,
    totalApr: totalApr ? Number(totalApr) : 0,
    // balance: typeof balance === 'string' ? 0 : balance,
  }
}
