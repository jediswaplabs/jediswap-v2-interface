// @ts-nocheck
// @ts-ignore

import { validateAndParseAddress } from 'starknet'
import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isEmpty, uniq } from 'lodash'
import { ChainId, Currency, CurrencyAmount } from '@vnaysn/jediswap-sdk-core'
import { useBalance } from '@starknet-react/core'
import { Trans } from '@lingui/macro'

import { updateAllVaults, updateUserVaults, updateInput } from './reducer'
import { useAppDispatch, useAppSelector } from '../hooks'
import teahouseLogo from '../../assets/vaults/teahouse.svg'
import { useAccountBalance, useAccountDetails } from '../../hooks/starknet-react'
import formatBalance from '../../utils/formatBalance'
import { Field } from './actions'
import { AppDispatch } from 'state'
import tryParseCurrencyAmount from 'lib/utils/tryParseCurrencyAmount'
import { useUnderlyingVaultAssets, useVaultTotalSupply } from 'components/vault/hooks'
import { useDefaultActiveTokens } from 'hooks/Tokens'
import { useCurrencyFromMap } from 'lib/hooks/useCurrency'
import { useConnectionReady } from 'connection/eagerlyConnect'
import { useCurrencyBalances } from '../connection/hooks'
import { useTotalSupply } from 'hooks/useTotalSupply'
import { AppState } from 'state/reducer'
import JSBI from 'jsbi'
import { DEFAULT_PERMISSIONLESS_API_RESPONSE } from '../../components/vault/constants'
import { removeExtraDecimals } from 'utils/removeExtraDecimals'

type Maybe<T> = T | null | undefined

const TEAHOUSE_CONTENT_ENDPOINT = 'https://vault-content-api.teahouse.finance'
const TEAHOUSE_TESTNET_CONTENT_ENDPOINT = 'https://test-vault-content-api.teahouse.finance/vaults'
const TEAHOUSE_VAULT_ENDPOINT = ' https://vault-api.teahouse.finance'
const TEAHOUSE_TESTNET_VAULT_ENDPOINT = 'https://test20-vault-api.teahouse.finance/vaults/type/permissionless'

// const TEAHOUSE_CONTENT_ENDPOINT = 'https://test-vault-content-api.teahouse.finance';
// const TEAHOUSE_VAULT_ENDPOINT = ' https://test-vault-api.teahouse.finance';
const TEAHOUSE_LOGO_URI = 'https://vault.teahouse.finance/icon-token'

export function useVaultState(): AppState['vaults'] {
  return useAppSelector((state) => state.vaults)
}

const getTeaHouseLogoUriPath = (iconName = '') => (iconName ? `${TEAHOUSE_LOGO_URI}/${iconName}` : null)
const getVaultListWithContents = async () => {
  //   const endpoint = `${TEAHOUSE_CONTENT_ENDPOINT}/vaults`
  const endpoint = TEAHOUSE_TESTNET_CONTENT_ENDPOINT
  const result = {}
  const response = await fetch(endpoint)
  const { vaults } = (await response.json()) ?? {}
  if (!vaults) {
    return
  }
  const filteredVaults = vaults.filter((vault) => vault.isActive).filter((vault) => vault.protocol === 'jediswap')
  // .filter((vault) => vault.chain === 'arbitrum')
  for (const vault of filteredVaults) {
    const shareAddress = vault.share?.address
    const data = {}
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
    result[shareAddress] = data
  }
  return result
}

const getPermissionlessVaultDataList = async () => {
  //   const endpoint = `${TEAHOUSE_VAULT_ENDPOINT}/vaults/type/permissionless`
  const endpoint = TEAHOUSE_TESTNET_VAULT_ENDPOINT
  const result = {}
  //   const response = await fetch(endpoint)
  //   const { vaults } = (await response.json()) ?? {}
  const { vaults } = DEFAULT_PERMISSIONLESS_API_RESPONSE // check --> api was failing
  if (!vaults) {
    return
  }
  for (const vault of vaults) {
    const { address } = vault
    const data = {}
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

    result[address] = data
  }
  return result
}

const getTokenPrices = async (contracts) => {
  // TODO VAULTS: replace with the real price fetching logic
  const result = Object.fromEntries(contracts.map((address) => [address, 1]))
  return result
}

export function useAllVaults() {
  const allVaults = useSelector((state) => state.vaults.allVaults)
  const dispatch = useAppDispatch()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const isFetchingRef = useRef(false)

  const loadData = async () => {
    if (isFetchingRef.current) {
      return
    }
    if (!isEmpty(allVaults)) {
      setIsLoading(false)
      return
    }
    setError(null)
    setIsLoading(true)
    isFetchingRef.current = true
    try {
      const [vaultListWithContents, permissionlessVaultDataList] = await Promise.all([
        getVaultListWithContents(),
        getPermissionlessVaultDataList(),
      ])
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
      const combinedData = addresses.reduce((acc, address) => {
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
      dispatch(updateAllVaults(combinedData))
    } catch (e) {
      console.error(e)
      setError('Error while loading vaults')
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return { data: allVaults, error, isLoading }
}

export function useVaultActionHandlers(): {
  onFieldAInput: (typedValue: string) => void
  onFieldBInput: (typedValue: string) => void
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

  return {
    onFieldAInput,
    onFieldBInput,
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
} {
  const { address: account } = useAccountDetails()
  const { independentField, typedValue } = useVaultState()

  const { data, isLoading, isError } = useUnderlyingVaultAssets()
  let token0All = 0
  let token1All = 0
  let priceRatio = 1

  if (data && !isLoading && !isError) {
    token0All = data[0]
    token1All = data[1]
    priceRatio = Number(token1All) / Number(token0All) // get clarity if need to add token decimals here
  }
  let totalSupply = 0
  const { data: data2, isLoading: isLoading2, isError: isError2 } = useVaultTotalSupply()
  if (data2 && !isLoading2 && !isError2) {
    totalSupply = data2
  }

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
  const currencyBalances: { [field in Field]?: CurrencyAmount<Currency> } = {
    [Field.CURRENCY_A]: balance1,
    [Field.CURRENCY_B]: balance2,
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
        independentField === Field.CURRENCY_A ? typedValue * priceRatio : typedValue / priceRatio
      const formattedDependentAmount = removeExtraDecimals(dependentTokenAmount, currencies[dependentField])
      return tryParseCurrencyAmount(formattedDependentAmount.toString(), currencies[dependentField])
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
