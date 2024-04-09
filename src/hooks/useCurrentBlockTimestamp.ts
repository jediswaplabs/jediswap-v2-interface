import { BigNumber } from '@ethersproject/bignumber'
import { useMemo } from 'react'

import { useInterfaceMulticall } from './useContract'
import { useMulticallContract } from './useContractV2'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useAccountDetails } from './starknet-react'
import { useContractRead } from '@starknet-react/core'
import { MULTICALL_NETWORKS } from 'contracts/multicall'
import { DEFAULT_CHAIN_ID } from 'constants/tokens'
import { MULTICALL_ABI } from 'contracts/multicall'

const useCurrentBlockTimestamp = () => {
  const { chainId } = useAccountDetails()
  const { data: blockTimeStamp } = useContractRead({
    functionName: 'get_current_block_timestamp',
    args: [],
    abi: MULTICALL_ABI,
    address: MULTICALL_NETWORKS[chainId ?? DEFAULT_CHAIN_ID],
    watch: true,
  })

  if (!blockTimeStamp) return undefined
  const { block_timestamp } = blockTimeStamp as any

  return BigNumber.from(block_timestamp.toString())
}

export default useCurrentBlockTimestamp
