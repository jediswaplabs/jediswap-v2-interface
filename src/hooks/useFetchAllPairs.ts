import { providerInstance } from 'utils/getLibrary'
import { updateAllPairs } from './../state/pairs/actions'
// import { useSingleCallResult } from '../state/multicall/hooks'
import { useFactoryContract } from './useContractV2'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../state'
import { useCallback, useMemo } from 'react'
import { useSingleCallResult } from 'state/multicall/hooks'
import { useAccountDetails } from './starknet-react'
import { DEFAULT_CHAIN_ID } from 'constants/tokens'
import { FACTORY_ADDRESS } from 'contracts/factoryAddress'
import { useQuery } from 'react-query'
import { validateAndParseAddress } from 'starknet'
import { ChainId } from '@vnaysn/jediswap-sdk-core'

export default function useFetchAllPairsCallback() {
  const { chainId } = useAccountDetails()
  const contract_address = useMemo(() => {
    if (!chainId) return undefined
    return FACTORY_ADDRESS[chainId]
  }, [chainId])

  const allPairs = useQuery({
    queryKey: [`get_all_pairs/${contract_address}/${chainId}`],
    queryFn: async () => {
      if (!chainId || chainId !== ChainId.MAINNET) return
      const provider = providerInstance(chainId ?? DEFAULT_CHAIN_ID)
      const contract_address = FACTORY_ADDRESS[chainId ?? DEFAULT_CHAIN_ID]
      const results = await provider.callContract({ entrypoint: 'get_all_pairs', contractAddress: contract_address })
      return results?.result
    },
  })

  return useMemo(() => {
    if (!allPairs.data || !Array.isArray(allPairs.data)) return []
    else return allPairs.data.map((pairAddress) => validateAndParseAddress(pairAddress))
  }, [allPairs])
}
