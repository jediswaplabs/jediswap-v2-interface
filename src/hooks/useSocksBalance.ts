import { ChainId, Token } from '@vnaysn/jediswap-sdk-core'
import { SOCKS_CONTROLLER_ADDRESSES } from 'constants/addresses'
import { useAccountDetails } from 'hooks/starknet-react'
import { useMemo } from 'react'
import { useTokenBalance } from 'state/connection/hooks'
import { useAccountDetails } from './starknet-react'

// technically a 721, not an ERC20, but suffices for our purposes
const SOCKS = new Token(ChainId.MAINNET, SOCKS_CONTROLLER_ADDRESSES[ChainId.MAINNET], 0)

export function useHasSocks(): boolean | undefined {
  const { address: account, chainId } = useAccountDetails()

  const balance = useTokenBalance(account ?? undefined, chainId === ChainId.MAINNET ? SOCKS : undefined)

  return useMemo(() => Boolean(balance?.greaterThan(0)), [balance])
}
