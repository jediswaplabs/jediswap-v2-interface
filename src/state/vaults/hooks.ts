// @ts-nocheck
// @ts-ignore

import { validateAndParseAddress } from 'starknet'
import { useDispatch, useSelector } from 'react-redux'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isEmpty, uniq } from 'lodash'
import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { useBalance } from '@starknet-react/core'

import { updateAllVaults, updateUserVaults, updateInput } from './reducer'
import { useAppDispatch } from '../hooks'
import teahouseLogo from '../../assets/vaults/teahouse.svg'
import { useAccountDetails } from '../../hooks/starknet-react'
import formatBalance from '../../utils/formatBalance'
import { Field } from './actions'
import { AppDispatch } from 'state'

const TEAHOUSE_CONTENT_ENDPOINT = 'https://vault-content-api.teahouse.finance'
const TEAHOUSE_VAULT_ENDPOINT = ' https://vault-api.teahouse.finance'
// const TEAHOUSE_CONTENT_ENDPOINT = 'https://test-vault-content-api.teahouse.finance';
// const TEAHOUSE_VAULT_ENDPOINT = ' https://test-vault-api.teahouse.finance';
const TEAHOUSE_LOGO_URI = 'https://vault.teahouse.finance/icon-token'

const getTeaHouseLogoUriPath = (iconName = '') => (iconName ? `${TEAHOUSE_LOGO_URI}/${iconName}` : null)
const getVaultListWithContents = async () => {
  const endpoint = `${TEAHOUSE_CONTENT_ENDPOINT}/vaults`
  const result = {}
  const response = await fetch(endpoint)
  const { vaults } = (await response.json()) ?? {}
  if (!vaults) {
    return
  }
  const filteredVaults = vaults
    .filter((vault) => vault.isActive)
    // .filter((vault) => vault.protocol === 'jediswap');
    .filter((vault) => vault.chain === 'arbitrum')
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
  const endpoint = `${TEAHOUSE_VAULT_ENDPOINT}/vaults/type/permissionless`
  const result = {}
  const response = await fetch(endpoint)
  const { vaults } = (await response.json()) ?? {}
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

export function useVaultInputState(): {
  typedValue: string
  independentField: string
} {
  const typedValue = useSelector((state) => state.vaults.typedValue)
  const independentField = useSelector((state) => state.vaults.independentField)

  return { typedValue, independentField }
}
