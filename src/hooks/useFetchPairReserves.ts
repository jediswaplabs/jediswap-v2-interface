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
import { num, uint256, validateAndParseAddress } from 'starknet'

export default function useFetchPairReserves(allPairs: any) {
  const { chainId } = useAccountDetails()
  const results = useQuery({
    queryKey: [`get_reserves/${chainId}/${allPairs}`],
    queryFn: async () => {
      const provider = providerInstance(chainId ?? DEFAULT_CHAIN_ID)
      const reserves = allPairs.map((pairAddress: string) => {
        if (!pairAddress) return Promise.resolve(undefined)
        const reserve = provider.callContract({ entrypoint: 'get_reserves', contractAddress: pairAddress })
        return reserve
      })

      const settledResults = await Promise.all(reserves)
      return settledResults
    },
  })

  const parsedReturnData = useMemo(() => {
    if (!results.data) return []
    const parsedResults = results.data.map((result) => {
      if (!result || !result.result)
        return {
          loading: false,
          result: undefined,
        }
      const data = result.result
      const resToHexArray = data.map((d: any) => num.toHex(d))
      const returnDataIterator = resToHexArray.flat()[Symbol.iterator]()
      return {
        result: {
          reserve0: num.toHex(
            uint256.uint256ToBN({ low: returnDataIterator.next().value, high: returnDataIterator.next().value })
          ),
          reserve1: num.toHex(
            uint256.uint256ToBN({ low: returnDataIterator.next().value, high: returnDataIterator.next().value })
          ),
        },
        loading: false,
      }
    })

    return parsedResults
  }, [results])

  return parsedReturnData
}
