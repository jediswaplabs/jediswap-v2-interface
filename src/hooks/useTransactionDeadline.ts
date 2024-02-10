import { BigNumber } from '@ethersproject/bignumber'
import { useAccountDetails } from 'hooks/starknet-react'
import { L2_DEADLINE_FROM_NOW } from 'constants/misc'
import { useMemo } from 'react'
import { useAppSelector } from 'state/hooks'
import { useBlock, useContractRead } from '@starknet-react/core'
import MultiContractABI from 'contracts/multicall/abi.json'
import { MULTICALL_NETWORKS } from 'contracts/multicall'
import { DEFAULT_CHAIN_ID } from 'constants/tokens'

// combines the block timestamp with the user setting to give the deadline that should be used for any submitted transaction
export default function useTransactionDeadline(): BigNumber | undefined {
  const { chainId } = useAccountDetails()
  const ttl = useAppSelector((state) => state.user.userDeadline)
  const blockTimestamp = useCurrentBlockTimestamp()
  return useMemo(() => {
    if (blockTimestamp && ttl) return BigNumber.from(blockTimestamp).add(ttl)
    return undefined
  }, [blockTimestamp, chainId, ttl])
}

const useCurrentBlockTimestamp = () => {
  const { chainId } = useAccountDetails()
  const { data: blockTimeStamp } = useContractRead({
    functionName: 'get_current_block_timestamp',
    args: [],
    abi: MultiContractABI,
    address: MULTICALL_NETWORKS[chainId ?? DEFAULT_CHAIN_ID],
    watch: true,
  })

  if (!blockTimeStamp) return undefined
  const { block_timestamp } = blockTimeStamp as any

  return BigNumber.from(block_timestamp.toString())
}
