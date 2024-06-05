import { useContractRead } from '@starknet-react/core'
import { useMemo } from 'react'
import { useAccountDetails } from './starknet-react'
import { useReferralContract } from './useContractV2'
import { feltArrToStr } from './usePositionTokenURI'

export function useTraderReferralCode(): {
  data: any
  error: any
  isLoading: boolean
} {
  const { chainId, address: account } = useAccountDetails()
  const referralContract = useReferralContract()

  const { data, error, isLoading } = useContractRead({
    functionName: 'get_referrer',
    address: referralContract?.address,
    abi: referralContract?.abi,
    args: account ? [account] : undefined,
    watch: true,
    parseResult: true,
    blockIdentifier: 'pending' as any,
    refetchInterval: 10000,
  })

  return useMemo(() => {
    return {
      data: data ? feltArrToStr([data as bigint]) : undefined,
      error,
      isLoading: isLoading,
    }
  }, [chainId, account, data, error, isLoading])
}
