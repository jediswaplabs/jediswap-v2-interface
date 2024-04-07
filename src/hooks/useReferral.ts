import { useMemo } from 'react'
import { NEVER_RELOAD, useSingleCallResult } from 'state/multicall/hooks'
import { useAccountDetails } from './starknet-react'
import { useReferralContract } from './useContractV2'

export function useUserCode(): string | null | undefined {
  const { chainId, address: account } = useAccountDetails()
  const referralContract = useReferralContract()

  const userCode = useSingleCallResult(referralContract, 'get_user_code', account ? [account] : undefined, NEVER_RELOAD)
  console.log(userCode, 'userCode')
  return useMemo(() => {
    if (!chainId) {
      return undefined
    }
    if (userCode.loading) {
      return null
    }
    if (userCode.result) {
      return userCode.result?.[0]
    }
    return undefined
  }, [chainId])
}

export function useCodeOwner(code: string): string | null | undefined {
  const { chainId } = useAccountDetails()
  const referralContract = useReferralContract()

  const codeOwner = useSingleCallResult(
    !!code ? referralContract : undefined,
    'get_code_owner',
    [code ?? undefined],
    NEVER_RELOAD
  )

  return useMemo(() => {
    if (!chainId) {
      return undefined
    }
    if (codeOwner.loading) {
      return null
    }
    if (codeOwner.result) {
      return codeOwner.result?.[0]
    }
    return undefined
  }, [chainId])
}
