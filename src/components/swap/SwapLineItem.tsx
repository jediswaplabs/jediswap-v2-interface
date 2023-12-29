// @ts-nocheck
import { t, Trans } from '@lingui/macro'
import { Currency, CurrencyAmount, Percent, TradeType } from '@vnaysn/jediswap-sdk-core'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import { animated, SpringValue } from 'react-spring'
import styled, { DefaultTheme } from 'styled-components'

import { LoadingRow } from 'components/Loader/styled'
import { ChainLogo } from 'components/Logo/ChainLogo'
import RouterLabel from 'components/RouterLabel'
import Row, { RowBetween } from 'components/Row'
import { MouseoverTooltip, TooltipSize } from 'components/Tooltip'
import { SUPPORTED_GAS_ESTIMATE_CHAIN_IDS } from 'constants/chains'
import { useFeesEnabled } from 'featureFlags/flags/useFees'
import useHoverProps from 'hooks/useHoverProps'
import { useUSDPrice } from 'hooks/useUSDPrice'
import { useIsMobile } from 'nft/hooks'
import { InterfaceTrade, SubmittableTrade, TradeFillType } from 'state/routing/types'
import { isPreviewTrade } from 'state/routing/utils'
import { useUserSlippageTolerance } from 'state/user/hooks'
import { SlippageTolerance } from 'state/user/types'
import { ExternalLink, ThemedText } from 'theme/components'
import { NumberType, useFormatter } from 'utils/formatNumbers'
import { getPriceImpactColor } from 'utils/prices'
import { GasBreakdownTooltip } from './GasBreakdownTooltip'
import { MaxSlippageTooltip } from './MaxSlippageTooltip'
import { RoutingTooltip, SwapRoute } from './SwapRoute'
import TradePrice from './TradePrice'

export enum SwapLineItemType {
  EXCHANGE_RATE,
  NETWORK_COST,
  INPUT_TOKEN_FEE_ON_TRANSFER,
  OUTPUT_TOKEN_FEE_ON_TRANSFER,
  PRICE_IMPACT,
  MAX_SLIPPAGE,
  SWAP_FEE,
  MAXIMUM_INPUT,
  MINIMUM_OUTPUT,
  ROUTING_INFO,
  TRANSACTION_DEADLINE,
}

const DetailRowValue = styled(ThemedText.BodySmall)`
  text-align: right;
  overflow-wrap: break-word;
`
const LabelText = styled(ThemedText.BodySmall)<{ hasTooltip?: boolean }>`
  cursor: ${({ hasTooltip }) => (hasTooltip ? 'help' : 'auto')};
  color: ${({ theme }) => theme.neutral1};
`
const ColorWrapper = styled.span<{ textColor?: keyof DefaultTheme }>`
  ${({ textColor, theme }) => textColor && `color: ${theme[textColor]};`}
`

const AutoBadge = styled(ThemedText.LabelMicro).attrs({ fontWeight: 535 })`
  background: ${({ theme }) => theme.jediNavyBlue};
  border-radius: 4px;
  border: 1px solid #fff;
  color: ${({ theme }) => theme.neutral1};
  height: 20px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  ::after {
    content: '${t`Auto`}';
  }
`

function SwapFeeTooltipContent({ hasFee }: { hasFee: boolean }) {
  const message = hasFee ? (
    <Trans>
      Fee is applied on a few token pairs to ensure the best experience with JediSwap. It is paid in the output token
      and has already been factored into the quote.
    </Trans>
  ) : (
    <Trans>
      Fee is applied on a few token pairs to ensure the best experience with JediSwap. There is no fee associated with
      this swap.
    </Trans>
  )
  return <>{message}</>
}

function Loading({ width = 50 }: { width?: number }) {
  return <LoadingRow data-testid="loading-row" height={15} width={width} />
}

function ColoredPercentRow({ percent, estimate }: { percent: Percent; estimate?: boolean }) {
  const { formatPercent } = useFormatter()
  const formattedPercent = (estimate ? '~' : '') + formatPercent(percent)
  return <ColorWrapper textColor={getPriceImpactColor(percent)}>{formattedPercent}</ColorWrapper>
}

function CurrencyAmountRow({ amount }: { amount: CurrencyAmount<Currency> }) {
  const { formatCurrencyAmount } = useFormatter()
  const formattedAmount = formatCurrencyAmount({ amount, type: NumberType.SwapDetailsAmount })
  return <>{`${formattedAmount} ${amount.currency.symbol}`}</>
}

function FeeRow({ trade: { swapFee, outputAmount } }: { trade: SubmittableTrade }) {
  const { formatNumber } = useFormatter()

  const feeCurrencyAmount = CurrencyAmount.fromRawAmount(outputAmount.currency, swapFee?.amount ?? 0)
  const { data: outputFeeFiatValue } = useUSDPrice(feeCurrencyAmount, feeCurrencyAmount?.currency)

  // Fallback to displaying token amount if fiat value is not available
  if (outputFeeFiatValue === undefined) {
    return <CurrencyAmountRow amount={feeCurrencyAmount} />
  }

  return <>{formatNumber({ input: outputFeeFiatValue, type: NumberType.FiatGasPrice })}</>
}

type LineItemData = {
  Label: React.FC
  Value: React.FC
  TooltipBody?: React.FC
  tooltipSize?: TooltipSize
  loaderWidth?: number
}

function useLineItem(props: SwapLineItemProps): LineItemData | undefined {
  const { trade, syncing, allowedSlippage, transactionDeadline, type } = props
  const { formatNumber, formatPercent } = useFormatter()
  const isAutoSlippage = useUserSlippageTolerance()[0] === SlippageTolerance.Auto
  const feesEnabled = useFeesEnabled()

  const isPreview = isPreviewTrade(trade)
  const { chainId } = trade.inputAmount.currency

  // Tracks the latest submittable trade's fill type, used to 'guess' whether or not to show price impact during preview
  const [lastSubmittableFillType, setLastSubmittableFillType] = useState<TradeFillType>()
  useEffect(() => {
    if (trade.fillType !== TradeFillType.None) {
      setLastSubmittableFillType(trade.fillType)
    }
  }, [trade.fillType])

  switch (type) {
    case SwapLineItemType.EXCHANGE_RATE:
      return {
        Label: () => <Trans>Rate</Trans>,
        Value: () => <TradePrice price={trade.executionPrice} />,
        TooltipBody: !isPreview ? () => <RoutingTooltip trade={trade} /> : undefined
      }
    case SwapLineItemType.NETWORK_COST:
      if (!SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(chainId)) {
        return
      }
      return {
        Label: () => <Trans>Network cost</Trans>,
        TooltipBody: () => <GasBreakdownTooltip trade={trade} />,
        Value: () => {
          if (isPreview) {
            return <Loading />
          }
          return (
            <Row gap="4px">
              <ChainLogo chainId={chainId} />
              {formatNumber({ input: trade.totalGasUseEstimateUSD, type: NumberType.FiatGasPrice })}
            </Row>
          )
        }
      }
    case SwapLineItemType.PRICE_IMPACT:
      return {
        Label: () => <Trans>Price impact</Trans>,
        TooltipBody: () => <Trans>The impact your trade has on the market price of this pool.</Trans>,
        Value: () => (isPreview ? <Loading /> : <ColoredPercentRow percent={trade?.priceImpact} estimate />)
      }
    case SwapLineItemType.MAX_SLIPPAGE:
      return {
        Label: () => <Trans>Max. slippage</Trans>,
        TooltipBody: () => <MaxSlippageTooltip {...props} />,
        Value: () => (
          <Row gap="8px">
            {isAutoSlippage && <AutoBadge />} {formatPercent(allowedSlippage)}
          </Row>
        )
      }
    case SwapLineItemType.SWAP_FEE: {
      if (!feesEnabled) {
        return
      }
      if (isPreview) {
        return { Label: () => <Trans>Fee</Trans>, Value: () => <Loading /> }
      }
      return {
        Label: () => (
          <>
            <Trans>Fee</Trans> {trade.swapFee && `(${formatPercent(trade.swapFee.percent)})`}
          </>
        ),
        TooltipBody: () => <SwapFeeTooltipContent hasFee={Boolean(trade.swapFee)} />,
        Value: () => <FeeRow trade={trade} />
      }
    }
    case SwapLineItemType.MAXIMUM_INPUT:
      if (trade.tradeType === TradeType.EXACT_INPUT) {
        return
      }
      return {
        Label: () => <Trans>Pay at most</Trans>,
        TooltipBody: () => (
          <Trans>
            The maximum amount you are guaranteed to spend. If the price slips any further, your transaction will
            revert.
          </Trans>
        ),
        Value: () => <CurrencyAmountRow amount={trade.maximumAmountIn(allowedSlippage)} />,
        loaderWidth: 70
      }
    case SwapLineItemType.MINIMUM_OUTPUT:
      if (trade.tradeType === TradeType.EXACT_OUTPUT) {
        return
      }
      return {
        Label: () => <Trans>Receive at least</Trans>,
        TooltipBody: () => (
          <Trans>Minimum received after slippage {!isAutoSlippage && `(${formatPercent(allowedSlippage)})`}</Trans>
        ),
        Value: () => <CurrencyAmountRow amount={trade.minimumAmountOut(allowedSlippage)} />,
        loaderWidth: 70
      }
    case SwapLineItemType.ROUTING_INFO:
      if (isPreview || syncing) {
        return { Label: () => <Trans>Order routing</Trans>, Value: () => <Loading /> }
      }
      return {
        Label: () => <Trans>Order routing</Trans>,
        TooltipBody: () => <SwapRoute data-testid="swap-route-info" trade={trade} />,
        tooltipSize: TooltipSize.Large,
        Value: () => <RouterLabel trade={trade} />
      }
    case SwapLineItemType.TRANSACTION_DEADLINE:
      return {
        Label: () => <Trans>Transaction Deadline</Trans>,
        TooltipBody: () => (
          <Trans>Your transaction will revert if it is pending for more than this period of time.</Trans>
        ),
        Value: () => <Row gap="8px">{transactionDeadline / 60} mins.</Row>,
        loaderWidth: 70
      }
  }
}

type ValueWrapperProps = PropsWithChildren<{
  lineItem: LineItemData
  labelHovered: boolean
  syncing: boolean
}>

function ValueWrapper({ children, lineItem, labelHovered, syncing }: ValueWrapperProps) {
  const { TooltipBody, tooltipSize, loaderWidth } = lineItem
  const isMobile = useIsMobile()

  if (syncing) {
    return <Loading width={loaderWidth} />
  }

  if (!TooltipBody) {
    return <DetailRowValue>{children}</DetailRowValue>
  }

  return (
    <MouseoverTooltip
      placement={isMobile ? 'auto' : 'right'}
      forceShow={labelHovered} // displays tooltip when hovering either both label or value
      size={tooltipSize}
      text={(
        <ThemedText.Caption color="neutral1">
          <TooltipBody />
        </ThemedText.Caption>
      )}
    >
      <DetailRowValue>{children}</DetailRowValue>
    </MouseoverTooltip>
  )
}

export interface SwapLineItemProps {
  trade: InterfaceTrade
  syncing: boolean
  allowedSlippage: Percent
  type: SwapLineItemType
  animatedOpacity?: SpringValue<number>
}

function SwapLineItem(props: SwapLineItemProps) {
  const [labelHovered, hoverProps] = useHoverProps()

  const LineItem = useLineItem(props)
  if (!LineItem) {
    return null
  }

  return (
    <animated.div style={{ opacity: props.animatedOpacity }}>
      <RowBetween>
        <LabelText {...hoverProps} hasTooltip={!!LineItem.TooltipBody} data-testid="swap-li-label">
          <LineItem.Label />
        </LabelText>
        <ValueWrapper lineItem={LineItem} labelHovered={labelHovered} syncing={props.syncing}>
          <LineItem.Value />
        </ValueWrapper>
      </RowBetween>
    </animated.div>
  )
}

export default React.memo(SwapLineItem)
