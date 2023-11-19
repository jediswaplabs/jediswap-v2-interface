import React, { useEffect, useState } from 'react'
import { useAccount, useBalance, useConnect, useProvider } from '@starknet-react/core'
import { constants } from 'starknet'
import { ChainId } from '@jediswap/sdk'

export const useAccountDetails = () => {
  const { account, address, isConnected, status } = useAccount()
  const [chainId, setChainId] = useState('')

  const { provider } = useProvider()

  useEffect(() => {
    const fetchChainId = async () => {
      try {
        const Id = await provider.getChainId()
        setChainId(Id)
      } catch (error) {
        console.error('Error fetching chainId:', error)
      }
    }

    fetchChainId()
  }, [status, provider])

  return { account, address, isConnected, chainId }
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
