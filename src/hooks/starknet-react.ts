import { useAccount, useBalance, useConnect, useProvider } from '@starknet-react/core'
import React from 'react'
import { constants } from 'starknet'

export const useAccountDetails = () => {
  const { account, address, isConnected , connector} = useAccount()
  return { account, address, isConnected, connector }
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
