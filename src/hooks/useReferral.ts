import { useContractRead } from '@starknet-react/core'
import { useMemo } from 'react'
import { isAddressValidForStarknet } from 'utils/addresses'
import { useAccountDetails } from './starknet-react'
import { useReferralContract } from './useContractV2'
import { feltArrToStr } from './usePositionTokenURI'

export function hex_to_ascii(str1: string) {
  var hex = str1.toString()
  var str = ''
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16))
  }
  return str
}

export function useUserCode(): {
  data: any
  error: any
  isLoading: boolean
} {
  const { chainId, address: account } = useAccountDetails()
  const referralContract = useReferralContract()

  const { data, error, isLoading } = useContractRead({
    functionName: 'get_user_code',
    address: referralContract?.address,
    abi: referralContract?.abi,
    args: account ? [account] : undefined,
    watch: true,
    parseResult: true,
    refetchInterval: 10000,
    blockIdentifier: 'pending' as any,
  })
  return useMemo(() => {
    return {
      data: data ? feltArrToStr([data as bigint]) : undefined,
      error,
      isLoading: isLoading,
    }
  }, [chainId, account, data, error, isLoading])
}

export function useCodeOwner(code: string): {
  data: any
  error: any
  isLoading: boolean
} {
  const { chainId } = useAccountDetails()
  const referralContract = useReferralContract()

  const { data, error, isLoading } = useContractRead({
    functionName: 'get_code_owner',
    address: referralContract?.address,
    abi: referralContract?.abi,
    args: code.length ? [code] : undefined,
    watch: true,
    blockIdentifier: 'pending' as any,
  })

  return useMemo(() => {
    return {
      data: data ? isAddressValidForStarknet(data as string) : undefined,
      error,
      isLoading: isLoading,
    }
  }, [chainId, code, data, error, isLoading])
}

export function useTraderReferralCode(): {
  data: any
  error: any
  isLoading: boolean
} {
  const { chainId, address: account } = useAccountDetails()
  const referralContract = useReferralContract()

  const { data, error, isLoading } = useContractRead({
    functionName: 'get_trader_referral_code',
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
