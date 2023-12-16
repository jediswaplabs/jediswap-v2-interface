// @ts-nocheck
import { Trans } from '@lingui/macro'
import { Percent } from '@vnaysn/jediswap-sdk-core'
import React, { useState } from 'react'
import { ChevronDown } from 'react-feather'
import styled, { useTheme } from 'styled-components'

import { TraceEvent, useTrace } from 'analytics'
import AnimatedDropdown from 'components/AnimatedDropdown'
import Column from 'components/Column'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import { RowBetween, RowFixed } from 'components/Row'
import { InterfaceTrade } from 'state/routing/types'
import { isSubmittableTrade } from 'state/routing/utils'
import { Separator, ThemedSeparator, ThemedText } from 'theme/components'
import { useFormatter } from 'utils/formatNumbers'
import GasEstimateTooltip from './GasEstimateTooltip'
import SwapLineItem, { SwapLineItemType } from './SwapLineItem'
import TradePrice from './TradePrice'
import { SwapRoute } from './SwapRoute'

const StyledHeaderRow = styled(RowBetween)<{ disabled: boolean; open: boolean }>`
  padding: 0;
  align-items: center;
  cursor: ${({ disabled }) => (disabled ? 'initial' : 'pointer')};
`

const RotatingArrow = styled(ChevronDown)<{ open?: boolean }>`
  transform: ${({ open }) => (open ? 'rotate(180deg)' : 'none')};
  transition: transform 0.1s linear;
`

const SwapDetailsWrapper = styled(Column)`
  padding-top: ${({ theme }) => theme.grids.md};
`

const Wrapper = styled(Column)``

interface SwapDetailsProps {
  trade?: InterfaceTrade
  syncing: boolean
  loading: boolean
  allowedSlippage: number
}

export default function SwapDetailsDropdown(props: SwapDetailsProps) {
  const { trade, syncing, loading, allowedSlippage } = props
  const theme = useTheme()
  const [showDetails, setShowDetails] = useState(false)

  if (!trade) {
    return null
  }

  return (
    <Wrapper>
      <StyledHeaderRow
        data-testid="swap-details-header-row"
        onClick={() => setShowDetails(!showDetails)}
        disabled={!trade}
        open={showDetails}
      >
        <RowFixed>
          {trade && (
            <LoadingOpacityContainer $loading={syncing} data-testid="trade-price-container">
              <TradePrice price={trade.executionPrice} />
            </LoadingOpacityContainer>
          )}
        </RowFixed>
        <RowFixed gap="xs">
          {!showDetails && isSubmittableTrade(trade) && (
            <GasEstimateTooltip trade={trade} loading={syncing || loading} />
          )}
          <RotatingArrow stroke={trade ? theme.neutral1 : theme.surface2} open={Boolean(trade && showDetails)} />
        </RowFixed>
      </StyledHeaderRow>
      <AdvancedSwapDetails {...props} open={showDetails} />
    </Wrapper>
  )
}

function AdvancedSwapDetails(props: SwapDetailsProps & { open: boolean }) {
  const { open, trade, allowedSlippage, syncing = false } = props
  const format = useFormatter()

  if (!trade) {
    return null
  }

  const lineItemProps = { trade, allowedSlippage, format, syncing }

  // @ts-ignore
  return (
    <AnimatedDropdown open={open}>
      <SwapDetailsWrapper gap="md" data-testid="advanced-swap-details">
        <ThemedSeparator reversed />
        <SwapLineItem {...lineItemProps} type={SwapLineItemType.PRICE_IMPACT} />
        <SwapLineItem {...lineItemProps} type={SwapLineItemType.MAX_SLIPPAGE} />
        <Separator />
        <SwapLineItem {...lineItemProps} type={SwapLineItemType.INPUT_TOKEN_FEE_ON_TRANSFER} />
        <SwapLineItem {...lineItemProps} type={SwapLineItemType.OUTPUT_TOKEN_FEE_ON_TRANSFER} />
        <SwapLineItem {...lineItemProps} type={SwapLineItemType.SWAP_FEE} />
        <SwapLineItem {...lineItemProps} type={SwapLineItemType.MINIMUM_OUTPUT} />
        <SwapLineItem {...lineItemProps} type={SwapLineItemType.NETWORK_COST} />
        <Separator />
        <SwapRoute data-testid="swap-route-info" trade={trade} />
      </SwapDetailsWrapper>
    </AnimatedDropdown>
  )
}
