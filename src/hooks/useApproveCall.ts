import { Currency, CurrencyAmount, Token, TokenAmount } from '@vnaysn/jediswap-sdk-core'
import { useCallback, useMemo } from 'react'
import { Call, CallData, RawArgs, cairo } from 'starknet'
import { useAccountDetails } from './starknet-react'
import { DEFAULT_CHAIN_ID, WETH } from 'constants/tokens'
import ERC20_ABI from 'abis/erc20.json'

export function useApprovalCall(amountToApprove?: CurrencyAmount<Currency>, spender?: string): () => Call | null {
  console.log(amountToApprove?.currency, 'amountToApprove')
  const { account, chainId } = useAccountDetails()
  const token: Token | undefined = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined
  console.log('🚀 ~ file: useApproveCall.ts:12 ~ useApprovalCall ~ token:', token)

  return useCallback(() => {
    if (!token) {
      console.error('no token')
      return null
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return null
    }

    if (!spender) {
      console.error('no spender')
      return null
    }

    const uint256AmountToApprove = cairo.uint256(amountToApprove.raw.toString())

    const approveArgs: RawArgs = {
      spender,
      amount: { type: 'struct', ...uint256AmountToApprove },
    }

    const contractCallData = new CallData(ERC20_ABI)
    const approveCalldata = contractCallData.compile('approve', approveArgs)

    const approveCall: Call = {
      contractAddress: token.address,
      entrypoint: 'approve',
      calldata: approveCalldata,
    }
    console.log('🚀 ~ file: useApproveCall.ts:50 ~ returnuseCallback ~ approveCall:', approveCall)

    return approveCall
  }, [amountToApprove, spender, token])
}
