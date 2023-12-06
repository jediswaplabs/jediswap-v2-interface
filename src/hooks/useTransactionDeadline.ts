import { BigNumber } from '@ethersproject/bignumber'
import { useAccountDetails } from 'hooks/starknet-react'
import { L2_DEADLINE_FROM_NOW } from 'constants/misc'
import { useMemo } from 'react'
import { useAppSelector } from 'state/hooks'

import useCurrentBlockTimestamp from './useCurrentBlockTimestamp'
import { L2_CHAIN_IDS } from 'constants/chainInfo'

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): BigNumber | undefined {
  const { chainId } = useAccountDetails()
  const ttl = useAppSelector((state) => state.user.userDeadline)
  const blockTimestamp = useCurrentBlockTimestamp()
  return useMemo(() => {
    if (blockTimestamp && chainId) return blockTimestamp.add(L2_DEADLINE_FROM_NOW)
    if (blockTimestamp && ttl) return blockTimestamp.add(ttl)
    return undefined
  }, [blockTimestamp, chainId, ttl])
}
