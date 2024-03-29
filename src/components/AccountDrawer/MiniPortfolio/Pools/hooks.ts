import { ChainId, Token } from '@vnaysn/jediswap-sdk-core'
import type { AddressMap } from '@uniswap/smart-order-router'
import MulticallJSON from '@uniswap/v3-periphery/artifacts/contracts/lens/UniswapInterfaceMulticall.sol/UniswapInterfaceMulticall.json'
import NFTPositionManagerJSON from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import { BaseContract } from 'ethers/lib/ethers'
import { useMemo } from 'react'

import { isSupportedChain } from 'constants/chains'
// import { DEPRECATED_RPC_PROVIDERS, RPC_PROVIDERS } from 'constants/providers'
import { useFallbackProviderEnabled } from 'featureFlags/flags/fallbackProvider'
import { ContractInput, useUniswapPricesQuery } from 'graphql/data/types-and-hooks'
import { toContractInput } from 'graphql/data/util'
import useStablecoinPrice from 'hooks/useStablecoinPrice'
import { NonfungiblePositionManager, UniswapInterfaceMulticall } from 'types/v3'
import { getContract } from 'utils'
import { CurrencyKey, currencyKey, currencyKeyFromGraphQL } from 'utils/currencyKey'
import { PositionInfo } from './cache'
import { useAccountDetails } from 'hooks/starknet-react'
import { MULTICALL_ADDRESSES, NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from 'constants/tokens'
import { publicProvider, useProvider } from '@starknet-react/core'

type ContractMap<T extends BaseContract> = { [key: string]: T }

// Constructs a chain-to-contract map, using the wallet's provider when available
function useContractMultichain<T extends BaseContract>(
  addressMap: AddressMap,
  ABI: any,
  chainIds?: ChainId[]
): ContractMap<T> {
  const { chainId: walletChainId } = useAccountDetails()
  const { provider: walletProvider } = useProvider()

  const networkProviders = publicProvider()

  return useMemo(() => {
    const relevantChains = chainIds ?? Object.keys(addressMap).filter((chainId) => isSupportedChain(chainId as ChainId))

    return relevantChains.reduce((acc: ContractMap<T>, chainId) => {
      // const provider =
      //   walletProvider && walletChainId === chainId
      //     ? walletProvider
      //     : isSupportedChain(chainId as ChainId)
      //     ? networkProviders[chainId]
      //     : undefined
      // if (provider) {
      //   acc[chainId] = getContract(addressMap[chainId] ?? '', ABI, provider) as T
      // }
      return acc
    }, {})
  }, [ABI, addressMap, chainIds, networkProviders, walletChainId, walletProvider])
}

export function useV3ManagerContracts(chainIds: ChainId[]): ContractMap<NonfungiblePositionManager> {
  return useContractMultichain<NonfungiblePositionManager>(
    NONFUNGIBLE_POSITION_MANAGER_ADDRESSES,
    NFTPositionManagerJSON.abi,
    chainIds
  )
}

export function useInterfaceMulticallContracts(chainIds: ChainId[]): ContractMap<UniswapInterfaceMulticall> {
  return useContractMultichain<UniswapInterfaceMulticall>(MULTICALL_ADDRESSES, MulticallJSON.abi, chainIds)
}

type PriceMap = { [key: CurrencyKey]: number | undefined }
export function usePoolPriceMap(positions: PositionInfo[] | undefined) {
  const contracts = useMemo(() => {
    if (!positions || !positions.length) {
      return []
    }
    // Avoids fetching duplicate tokens by placing in map
    const contractMap = positions.reduce((acc: { [key: string]: ContractInput }, { pool: { token0, token1 } }) => {
      // acc[currencyKey(token0)] = toContractInput(token0)
      // acc[currencyKey(token1)] = toContractInput(token1)
      return acc
    }, {})
    return Object.values(contractMap)
  }, [positions])

  const { data, loading } = useUniswapPricesQuery({ variables: { contracts }, skip: !contracts.length })

  const priceMap = useMemo(
    () =>
      data?.tokens?.reduce((acc: PriceMap, current) => {
        if (current) {
          acc[currencyKeyFromGraphQL(current)] = current.project?.markets?.[0]?.price?.value
        }
        return acc
      }, {}) ?? {},
    [data?.tokens]
  )

  return { priceMap, pricesLoading: loading && !data }
}

function useFeeValue(token: Token, fee: number | undefined, queriedPrice: number | undefined) {
  const stablecoinPrice = useStablecoinPrice(!queriedPrice ? token : undefined)
  return useMemo(() => {
    // Prefers gql price, as fetching stablecoinPrice will trigger multiple infura calls for each pool position
    const price = queriedPrice ?? (stablecoinPrice ? parseFloat(stablecoinPrice.toSignificant()) : undefined)
    const feeValue = fee && price ? fee * price : undefined

    return [price, feeValue]
  }, [fee, queriedPrice, stablecoinPrice])
}

export function useFeeValues(position: PositionInfo) {
  const [priceA, feeValueA] = useFeeValue(position.pool.token0, position.fees?.[0], position.prices?.[0])
  const [priceB, feeValueB] = useFeeValue(position.pool.token1, position.fees?.[1], position.prices?.[1])

  return { priceA, priceB, fees: (feeValueA || 0) + (feeValueB || 0) }
}
