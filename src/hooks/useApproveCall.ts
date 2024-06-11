import { Currency, CurrencyAmount, Token, TokenAmount } from '@vnaysn/jediswap-sdk-core'
import { useCallback, useMemo } from 'react'
import { Call, CallData, RawArgs, cairo } from 'starknet'
import { useAccountDetails } from './starknet-react'
import { DEFAULT_CHAIN_ID, WETH } from 'constants/tokens'
import ERC20_ABI from 'abis/erc20.json'

export function useApprovalCall(amountToApprove?: CurrencyAmount<Currency>, spender?: string): () => Call | null {
  const token: Token | undefined = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined

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

    return approveCall
  }, [amountToApprove, spender, token])
}
