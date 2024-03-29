import { BigNumber } from '@ethersproject/bignumber'
import type { Web3Provider } from '@ethersproject/providers'
import { parseEther } from '@ethersproject/units'
import { useAccountDetails } from 'hooks/starknet-react'
import { useNativeCurrencyBalances } from 'state/connection/hooks'

interface WalletBalanceProps {
  address: string
  balance: string
  weiBalance: BigNumber
  provider?: Web3Provider
}

export function useWalletBalance(): WalletBalanceProps {
  const { account: address } = useAccountDetails()
  // const balanceString = useNativeCurrencyBalances(address ? [address] : [])?.[address ?? '']?.toSignificant(3) || '0'

  return {
    address: '',
    balance: '0',
    weiBalance: parseEther('0'),
    provider: undefined,
  }
}
