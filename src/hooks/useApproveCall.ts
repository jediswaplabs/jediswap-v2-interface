import { CurrencyAmount, Token, ETHER, TokenAmount, Trade, WETH } from '@jediswap/sdk'
import { useCallback, useMemo } from 'react'
import { Call, CallData, RawArgs, stark, uint256 } from 'starknet'
import { Field as SwapField } from '../state/swap/actions'
import { computeSlippageAdjustedAmounts } from '../utils/priceV2'
import { TradeType } from './useApproveCallback'
import { DEFAULT_CHAIN_ID } from 'constants/tokens'
import { useAccountDetails } from './starknet-react'

export function useApprovalCall(amountToApprove?: CurrencyAmount, spender?: string): () => Call | null {
  const { account, chainId } = useAccountDetails()
  const token: Token | undefined =
    amountToApprove instanceof TokenAmount
      ? amountToApprove.token
      : amountToApprove?.currency === ETHER
      ? WETH[chainId ?? DEFAULT_CHAIN_ID]
      : undefined

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

    const uint256AmountToApprove = uint256.bnToUint256(amountToApprove.raw.toString())

    const approveArgs: RawArgs = {
      spender,
      amount: { type: 'struct', ...uint256AmountToApprove },
    }

    const approveCalldata = CallData.compile(approveArgs)

    const approveCall: Call = {
      contractAddress: token.address,
      entrypoint: 'approve',
      calldata: approveCalldata,
    }

    return approveCall
  }, [amountToApprove, spender, token])
}
