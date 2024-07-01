import { useContractRead } from '@starknet-react/core'
import { useEffect, useMemo } from 'react'
import { useAccountDetails } from './starknet-react'
import { useReferralContract } from './useContractV2'
import { feltArrToStr } from './usePositionTokenURI'
import fetchReferrer from 'api/fetchReferrer'
import useParsedQueryString from './useParsedQueryString'
import { parseReferralCodeURLParameter } from 'state/swap/hooks'
import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { isAddressValidForStarknet } from 'utils/addresses'
import { Call, getChecksumAddress, validateChecksumAddress } from 'starknet'

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

export interface ILocalStorageUserData {
  referredBy: string
  onChain: boolean
  isCorrect: boolean
}

/*
  This hook is used to get the referral state of the user.
  It checks the local storage for the referral code of the user.
  If the referral code is not present in the local storage, it fetches the referral code from the blockchain.
  If the referral code is not present in the local storage and the referral code is present in the URL, it sets the referral code in the local storage.
  If the referral code is present in the local storage, it checks if the referral code is on-chain or off-chain.
  If the referral code is off-chain and the referral code is present in the URL, it sets the referral code in the local storage.
  If the referral code is on-chain, it does not do anything.
*/
export function useReferralstate() {
  const { chainId, address: account } = useAccountDetails()
  const parsedQs = useParsedQueryString()
  const referralCodeFromUrl = parseReferralCodeURLParameter(parsedQs.referralCode)
  const isTestnet = parsedQs.testnet == 'true'
  const localStorageData = getReferralInfoFromStorageFrouser(account, chainId)

  useEffect(() => {
    if (chainId && account) {
      if (localStorageData === undefined || localStorageData?.onChain === false) {
        fetchReferrer(chainId, account).then(
          (dataFromBlockChain: { id: number; jsonrpc: string; result: string[] }) => {
            if (dataFromBlockChain.result[0] !== '0x0') {
              const referralCodeObject: ILocalStorageUserData = {
                referredBy: dataFromBlockChain.result[0],
                onChain: true,
                isCorrect: true,
              }
              localStorage.setItem('referralCode', JSON.stringify({ [chainId]: { [account]: referralCodeObject } }))
            } else if (
              referralCodeFromUrl &&
              ((isTestnet && chainId != ChainId.MAINNET) || (!isTestnet && chainId == ChainId.MAINNET))
            ) {
              const referralCodeObject: ILocalStorageUserData = {
                referredBy: referralCodeFromUrl,
                onChain: false,
                isCorrect: isAddressValidForReferral(account, referralCodeFromUrl),
              }
              localStorage.setItem('referralCode', JSON.stringify({ [chainId]: { [account]: referralCodeObject } }))
            }
          }
        )
      }
    }
  }, [chainId, account, referralCodeFromUrl, isTestnet])
}

/*
  This function is used to check if the address is valid for referral.
  It checks if the address is valid for starknet.
  It checks if the address is not same as the user address.
  It checks if the address is a valid checksum address.
*/
function isAddressValidForReferral(userAddress: string, refereeAddress: string) {
  return (
    isAddressValidForStarknet(refereeAddress) !== false &&
    getChecksumAddress(userAddress) != getChecksumAddress(refereeAddress) &&
    validateChecksumAddress(refereeAddress) !== false
  )
}

/*
  This function is used to get the referral code of the user from the local storage.
  It takes the user address and the chain id as input.
  It returns the referral code of the user from the local storage.
*/
export function getReferralInfoFromStorageFrouser(userAddress: string | undefined, chainId: ChainId | undefined) {
  const rawLocalStorageData = localStorage.getItem('referralCode')
  const localStorageData: ILocalStorageUserData | undefined =
    rawLocalStorageData && JSON.parse(rawLocalStorageData)?.[chainId as any]?.[userAddress as any]
  return localStorageData
}

/*
  This is done to avoid the user setting the referral code in the URL multiple times.
  If the set_referrer call is successful, the referral code is set in the local storage.
*/
export function setOnChainReferralTrueForuser(userAddress: string, chainId: ChainId, calls: Call[]) {
  const setReferrerCall = calls.find((call) => call.entrypoint === 'set_referrer')
  if (setReferrerCall) {
    const userReferralInfoLocal = getReferralInfoFromStorageFrouser(userAddress, chainId)
    if (userReferralInfoLocal && userReferralInfoLocal.onChain === false) {
      const newInfo = {
        ...userReferralInfoLocal,
        onChain: true,
      }
      localStorage.setItem('referralCode', JSON.stringify({ [chainId]: { [userAddress]: newInfo } }))
    }
  }
}
