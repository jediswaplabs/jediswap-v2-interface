import { BigNumber } from '@ethersproject/bignumber'
import { useAccountDetails } from 'hooks/starknet-react'
import { useMemo } from 'react'
import { useAppSelector } from 'state/hooks'

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): BigNumber | undefined {
  const { chainId } = useAccountDetails()
  const ttl = useAppSelector((state) => state.user.userDeadline)
  const currentTimestamp = BigNumber.from(Math.round(Number(new Date()) / 1000).toString())
  return useMemo(() => {
    if (currentTimestamp && ttl) return BigNumber.from(currentTimestamp).add(ttl)
    return undefined
  }, [currentTimestamp, chainId, ttl])
}
