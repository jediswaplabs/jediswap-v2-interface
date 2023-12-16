import { BigNumber } from '@ethersproject/bignumber'
import { useMemo } from 'react'

import { useInterfaceMulticall } from './useContract'
import { useMulticallContract } from './useContractV2'
import { useSingleCallResult } from 'state/multicall/hooks'

// gets the current timestamp from the blockchain
export default function useCurrentBlockTimestamp(): BigNumber | undefined {
  const multicall = useMulticallContract()
  return useSingleCallResult(multicall, 'get_current_block_timestamp')?.result?.[0]
}
