// @ts-nocheck
import { Trans } from '@lingui/macro'
import styled from 'styled-components'
import React from 'react'

import Column, { AutoColumn } from 'components/Column'
import RoutingDiagram from 'components/RoutingDiagram/RoutingDiagram'
import { RowBetween, RowFixed } from 'components/Row'
import { SUPPORTED_GAS_ESTIMATE_CHAIN_IDS } from 'constants/chains'
import useAutoRouterSupported from 'hooks/useAutoRouterSupported'
import { ClassicTrade, SubmittableTrade } from 'state/routing/types'
import { Divider, Separator, ThemedText } from 'theme/components'
import { NumberType, useFormatter } from 'utils/formatNumbers'
import getRoutingDiagramEntries from 'utils/getRoutingDiagramEntries'
import RouterLabel from '../RouterLabel'
import GasEstimateTooltip from './GasEstimateTooltip'
import { ThemedRouter as RouterIcon } from '../Icons/Router'
import { themeTextGradient } from '../../theme/styles'

const StyledLabelIcon = styled(RouterIcon)``
const LabelText = styled(ThemedText.BodySmall)`
  ${({ theme }) =>
    themeTextGradient({
      gradientColor: theme.brandedGradientReversed,
    })};
`

// TODO(WEB-2022)
// Can `trade.gasUseEstimateUSD` be defined when `chainId` is not in `SUPPORTED_GAS_ESTIMATE_CHAIN_IDS`?
function useGasPrice({ gasUseEstimateUSD, inputAmount }: ClassicTrade) {
  const { formatNumber } = useFormatter()
  if (!gasUseEstimateUSD || !SUPPORTED_GAS_ESTIMATE_CHAIN_IDS.includes(inputAmount.currency.chainId)) {
    return undefined
  }

  return gasUseEstimateUSD === 0 ? '<$0.01' : formatNumber({ input: gasUseEstimateUSD, type: NumberType.FiatGasPrice })
}

function RouteLabel({ trade }: { trade: SubmittableTrade }) {
  return (
    <RowBetween>
      <ThemedText.BodySmall color="neutral2">Order Routing</ThemedText.BodySmall>
      <RouterLabel trade={trade} color="neutral1" />
    </RowBetween>
  )
}

function PriceImpactRow({ trade }: { trade: ClassicTrade }) {
  const { formatPercent } = useFormatter()
  return (
    <AutoColumn gap="sm">
      <ThemedText.SubHeaderSmall color="neutral1">
        <Trans>Price Impact: {formatPercent(trade.priceImpact)}</Trans>
      </ThemedText.SubHeaderSmall>
    </AutoColumn>
  )
}

export function RoutingTooltip({ trade }: { trade: SubmittableTrade }) {
  return <PriceImpactRow trade={trade} />
}

export function SwapRoute({ trade }: { trade: ClassicTrade }) {
  const { inputAmount, outputAmount } = trade
  const routes = getRoutingDiagramEntries(trade)
  const gasPrice = useGasPrice(trade)

  return useAutoRouterSupported() ? (
    <Column gap="md">
      <RowFixed gap="xs">
        <StyledLabelIcon />
        <LabelText fontWeight={700}>Auto Routing {routes?.[0].type}</LabelText>
      </RowFixed>
      <RoutingDiagram routes={routes} currencyIn={inputAmount.currency} currencyOut={outputAmount.currency} />
      <ThemedText.Caption color="neutral2">
        {Boolean(gasPrice) && <Trans>Best price route costs ~{gasPrice} in gas. </Trans>}
        {Boolean(gasPrice)}
      </ThemedText.Caption>
    </Column>
  ) : (
    <RoutingDiagram routes={routes} currencyIn={inputAmount.currency} currencyOut={outputAmount.currency} />
  )
}
