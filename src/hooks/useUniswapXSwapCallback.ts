import { BigNumber } from '@ethersproject/bignumber'
import * as Sentry from '@sentry/react'
import { CustomUserProperties, SwapEventName } from '@uniswap/analytics-events'
import { Percent } from '@uniswap/sdk-core'
import { DutchOrder, DutchOrderBuilder } from '@uniswap/uniswapx-sdk'
import { useWeb3React } from '@web3-react/core'
import { useCachedPortfolioBalancesQuery } from 'components/PrefetchBalancesWrapper/PrefetchBalancesWrapper'
import { getConnection } from 'connection'
import { formatSwapSignedAnalyticsEventProperties } from 'lib/utils/analytics'
import { useCallback } from 'react'
import { DutchOrderTrade, TradeFillType } from 'state/routing/types'

import { SignatureExpiredError, UserRejectedRequestError } from 'utils/errors'
import { signTypedData } from 'utils/signing'
import { didUserReject, swapErrorToUserReadableMessage } from 'utils/swapErrorToUserReadableMessage'
import { getWalletMeta } from 'utils/walletMeta'

type DutchAuctionOrderError = { errorCode?: number; detail?: string }
type DutchAuctionOrderSuccess = { hash: string }
type DutchAuctionOrderResponse = DutchAuctionOrderError | DutchAuctionOrderSuccess

const isErrorResponse = (res: Response, order: DutchAuctionOrderResponse): order is DutchAuctionOrderError =>
  res.status < 200 || res.status > 202

const UNISWAP_API_URL = process.env.REACT_APP_UNISWAP_API_URL
if (UNISWAP_API_URL === undefined) {
  throw new Error(`UNISWAP_API_URL must be a defined environment variable`)
}

// getUpdatedNonce queries the UniswapX service for the most up-to-date nonce for a user.
// The `nonce` exists as part of the Swap quote response already, but if a user submits back-to-back
// swaps without refreshing the quote (and therefore uses the same nonce), then the subsequent swaps will fail.
//
async function getUpdatedNonce(swapper: string, chainId: number): Promise<BigNumber | null> {
  try {
    const res = await fetch(`${UNISWAP_API_URL}/nonce?address=${swapper}&chainId=${chainId}`)
    const { nonce } = await res.json()
    return BigNumber.from(nonce)
  } catch (e) {
    Sentry.withScope(function (scope) {
      scope.setTag('method', 'getUpdatedNonce')
      scope.setLevel('warning')
      Sentry.captureException(e)
    })
    return null
  }
}

export function useUniswapXSwapCallback({
  trade,
  allowedSlippage,
  fiatValues,
}: {
  trade?: DutchOrderTrade
  fiatValues: { amountIn?: number; amountOut?: number; feeUsd?: number }
  allowedSlippage: Percent
}) {
  const { account, provider, connector } = useWeb3React()

  const { data } = useCachedPortfolioBalancesQuery({ account })
  const portfolioBalanceUsd = data?.portfolios?.[0]?.tokensTotalDenominatedValue?.value

  return useCallback(() => {}, [])
}
