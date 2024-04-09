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
import { useQuery } from 'react-query'
import { providerInstance } from 'utils/getLibrary'
import { num } from 'starknet'

const useCurrentBlockTimestamp = () => {
  const { chainId } = useAccountDetails()
  const current_block_timestamp = useQuery({
    queryKey: [`timestamp/${chainId}`],
    queryFn: async () => {
      if (!chainId) return undefined
      const provider = providerInstance(chainId)
      const results: any = await provider.getBlockWithTxHashes()
      return results?.timestamp
    },
  })

  return current_block_timestamp.data
}

export default useCurrentBlockTimestamp
