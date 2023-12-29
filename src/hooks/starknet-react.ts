import React, { useEffect, useState } from 'react'
import { Connector, useAccount, useBalance, useConnect, useProvider } from '@starknet-react/core'
import { AccountInterface, constants } from 'starknet'
import { ChainId, Currency, Token } from '@vnaysn/jediswap-sdk-core'
import { WETH } from '@jediswap/sdk'
import { useDefaultActiveTokens } from './Tokens'
import formatBalance from 'utils/formatBalance'
// Define the type for the balances object
interface TokenBalance {
  balance: any // Replace 'any' with the correct type of balance
  error: any // Replace 'any' with the correct type of error
  isLoading: any // Replace 'any' with the correct type of isLoading
}

declare enum StarknetChainId {
  SN_MAIN = '0x534e5f4d41494e',
  SN_GOERLI = '0x534e5f474f45524c49',
  SN_GOERLI2 = '0x534e5f474f45524c4932',
}

// Function to convert StarknetChainId to ChainId
const convertStarknetToChainId = (starknetId: StarknetChainId): ChainId => {
  switch (starknetId) {
    case StarknetChainId.SN_MAIN:
      return ChainId.MAINNET
    case StarknetChainId.SN_GOERLI:
    case StarknetChainId.SN_GOERLI2:
      return ChainId.GOERLI
    default:
      return ChainId.MAINNET // Return undefined if no match found
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
  const [chainId, setChainId] = useState<ChainId>(ChainId.MAINNET)

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

export const useAccountBalance = (currency: Currency) => {
  const { address } = useAccountDetails()
  const tokenAddress = (currency as any)?.address

  const { data } = useBalance({
    token: tokenAddress,
    address,
    watch: true,
  })

  return { balance: data?.formatted, formatted: formatBalance(data?.formatted) }
}
