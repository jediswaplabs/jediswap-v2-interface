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

/* 
  This function is used to fetch the referrer of the user from bloackchain.
  It takes the chain id and the user address as input.
  It returns the referrer of the user.
  It fetches data on every pending block.
  Not used anymore.
*/
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
  isNotifClosed: boolean
}
export interface ILocalStorageReferralData {
  [chainId: string]: {
    [userAddress: string]: ILocalStorageUserData
  }
}

const localStoreReferralDataObjectName = 'referralCodeV2'

/* 
  This function is used to set the referral code in the local storage.
  It takes the referral code as input.
  It sets the referral code in the local storage.
*/
function setToReferralDataToLocalStore(data: string) {
  localStorage.setItem(localStoreReferralDataObjectName, data)
}

/*
  This function is used to get the referral code of the user from the local storage.
  It takes the user address and the chain id as input.
  It returns the referral code of the user from the local storage.
*/
export function getReferralInfoFromStorageForuser() {
  const rawLocalStorageData = localStorage.getItem(localStoreReferralDataObjectName)
  const localStorageData: ILocalStorageReferralData | undefined = rawLocalStorageData && JSON.parse(rawLocalStorageData)
  return localStorageData
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

  useEffect(() => {
    if (chainId && account) {
      const referralData = getReferralInfoFromStorageForuser()
      const localStorageData = referralData && referralData[chainId] && referralData[chainId][account]
      if (!localStorageData || localStorageData?.onChain === false) {
        fetchReferrer(chainId, account).then(
          (dataFromBlockChain: { id: number; jsonrpc: string; result: string[] }) => {
            if (dataFromBlockChain.result[0] !== '0x0') {
              const referralCodeObject: ILocalStorageUserData = {
                referredBy: dataFromBlockChain.result[0],
                onChain: true,
                isCorrect: true,
                isNotifClosed: false,
              }

              if (!referralData) {
                setToReferralDataToLocalStore(JSON.stringify({ [chainId]: { [account]: referralCodeObject } }))
              } else {
                const newLocalStorageData = {
                  ...referralData,
                  [chainId]: {
                    ...referralData[chainId],
                    [account]: referralCodeObject,
                  },
                }
                setToReferralDataToLocalStore(JSON.stringify(newLocalStorageData))
              }
            } else if (
              referralCodeFromUrl &&
              ((isTestnet && chainId != ChainId.MAINNET) || (!isTestnet && chainId == ChainId.MAINNET))
            ) {
              const referralCodeObject: ILocalStorageUserData = {
                referredBy: referralCodeFromUrl,
                onChain: false,
                isCorrect: isAddressValidForReferral(account, referralCodeFromUrl),
                isNotifClosed: false,
              }
              if (!referralData) {
                setToReferralDataToLocalStore(JSON.stringify({ [chainId]: { [account]: referralCodeObject } }))
              } else {
                const newLocalStorageData = {
                  ...referralData,
                  [chainId]: {
                    ...referralData[chainId],
                    [account]: referralCodeObject,
                  },
                }
                setToReferralDataToLocalStore(JSON.stringify(newLocalStorageData))
              }
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
  This is done to avoid the user setting the referral code in the URL multiple times.
  If the set_referrer call is successful, the referral code is set in the local storage.
*/
export function setOnChainReferralTrueForuser(userAddress: string, chainId: ChainId, calls: Call[]) {
  const setReferrerCall = calls.find((call) => call.entrypoint === 'set_referrer')
  if (setReferrerCall) {
    const referralInfoLocal = getReferralInfoFromStorageForuser()
    const userReferralInfoLocal =
      referralInfoLocal && referralInfoLocal[chainId] && referralInfoLocal[chainId][userAddress]
    if (userReferralInfoLocal && userReferralInfoLocal.onChain === false) {
      const newInfo = {
        ...userReferralInfoLocal,
        onChain: true,
      }

      // replace newinfo for user and keep the other user and chain data
      const newLocalStorageData = {
        ...referralInfoLocal,
        [chainId]: {
          ...referralInfoLocal[chainId],
          [userAddress]: newInfo,
        },
      }
      setToReferralDataToLocalStore(JSON.stringify(newLocalStorageData))
    }
  }
}

/* 
  This function is used to set the isNotifClosed flag to true for the user.
  It takes the user address and the chain id as input.
  It sets the isNotifClosed flag to true for the user in the local storage.
*/
export function setIsNotifClosedForuser(userAddress: string, chainId: ChainId) {
  const referralInfoLocal = getReferralInfoFromStorageForuser()
  const userReferralInfoLocal =
    referralInfoLocal && referralInfoLocal[chainId] && referralInfoLocal[chainId][userAddress]
  if (userReferralInfoLocal) {
    const newInfo = {
      ...userReferralInfoLocal,
      isNotifClosed: true,
    }

    // replace newinfo for user and keep the other user and chain data
    const newLocalStorageData = {
      ...referralInfoLocal,
      [chainId]: {
        ...referralInfoLocal[chainId],
        [userAddress]: newInfo,
      },
    }
    setToReferralDataToLocalStore(JSON.stringify(newLocalStorageData))
  }
}
