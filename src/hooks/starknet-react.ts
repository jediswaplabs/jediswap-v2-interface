import React, { useEffect, useState } from 'react'
import { Connector, useAccount, useBalance, useConnect, useProvider } from '@starknet-react/core'
import { AccountInterface, constants } from 'starknet'
import { ChainId } from '@jediswap/sdk'

declare enum StarknetChainId {
  SN_MAIN = '0x534e5f4d41494e',
  SN_GOERLI = '0x534e5f474f45524c49',
  SN_GOERLI2 = '0x534e5f474f45524c4932',
}

// Function to convert StarknetChainId to ChainId
const convertStarknetToChainId = (starknetId: StarknetChainId): ChainId => {
  switch (starknetId) {
    case StarknetChainId.SN_MAIN:
      return ChainId.SN_MAIN
    case StarknetChainId.SN_GOERLI:
    case StarknetChainId.SN_GOERLI2:
      return ChainId.SN_GOERLI
    default:
      return ChainId.SN_MAIN // Return undefined if no match found
  }
}

export const useAccountDetails = (): {
  account: AccountInterface | undefined
  address: string | undefined
  isConnected: boolean | undefined
  chainId: ChainId
  connector: Connector | undefined
} => {
  const { account, address, isConnected, status, connector } = useAccount()
  console.log('🚀 ~ file: starknet-react.ts:33 ~ status:', status)
  console.log('🚀 ~ file: starknet-react.ts:33 ~ isConnected:', isConnected)
  const [chainId, setChainId] = useState<ChainId>(ChainId.SN_MAIN)

  const { provider } = useProvider()

  useEffect(() => {
    const fetchChainId = async () => {
      try {
        const Id = await provider.getChainId()
        const convertedId: ChainId = convertStarknetToChainId(Id)
        setChainId(convertedId)
      } catch (error) {
        console.error('Error fetching chainId:', error)
      }
    }

    fetchChainId()
  }, [status, provider, account])

  return { account, address, isConnected, chainId, connector }
}

export const useConnectors = () => {
  const { connect, connectors } = useConnect()
  return { connect, connectors }
}

export const useBalances = () => {
  const { address } = useAccount()
  const {
    data: balance,
    error,
    isLoading,
  } = useBalance({
    address,
    watch: true,
  })

  return { balance }
}
