// @ts-nocheck
import { Trans } from '@lingui/macro'
import { Currency } from '@vnaysn/jediswap-sdk-core'
import { ReactNode } from 'react'
import styled from 'styled-components'

import { AutoColumn } from 'components/Column'
import Row from 'components/Row'
import { nativeOnChain } from 'constants/tokens'
import { InterfaceTrade } from 'state/routing/types'
import { isPreviewTrade, isUniswapXTrade } from 'state/routing/utils'
import { Divider, ExternalLink, ThemedText } from 'theme/components'
import { NumberType, useFormatter } from 'utils/formatNumbers'

const Container = styled(AutoColumn)`
  padding: 4px;
`

type GasCostItemProps = { title: ReactNode; itemValue?: React.ReactNode; amount?: number }

const GasCostItem = ({ title, amount, itemValue }: GasCostItemProps) => {
  const { formatNumber } = useFormatter()

  if (!amount && !itemValue) {
    return null
  }

  const value = itemValue ?? formatNumber({ input: amount, type: NumberType.FiatGasPrice })
  return (
    <Row justify="space-between">
      <ThemedText.SubHeaderSmall>{title}</ThemedText.SubHeaderSmall>
      <ThemedText.SubHeaderSmall color="neutral1">{value}</ThemedText.SubHeaderSmall>
    </Row>
  )
}

type GasBreakdownTooltipProps = { trade: InterfaceTrade }

export function GasBreakdownTooltip({ trade }: GasBreakdownTooltipProps) {
  const inputCurrency = trade.inputAmount.currency
  const native = nativeOnChain(inputCurrency.chainId)

  if (isPreviewTrade(trade)) {
    return <NetworkFeesDescription native={native} />
  }

  const swapEstimate = trade.gasUseEstimateUSD
  const approvalEstimate = trade.approveInfo.needsApprove ? trade.approveInfo.approveGasEstimateUSD : undefined
  const showEstimateDetails = approvalEstimate

  const description = <NetworkFeesDescription native={native} />

  if (!showEstimateDetails) {
    return description
  }

  return (
    <Container gap="md">
      <AutoColumn gap="sm">
        <GasCostItem title={<Trans>Allow {inputCurrency.symbol} (one time)</Trans>} amount={approvalEstimate} />
        <GasCostItem title={<Trans>Swap</Trans>} amount={swapEstimate} />
      </AutoColumn>
      <Divider />
      {description}
    </Container>
  )
}

function NetworkFeesDescription({ native }: { native: Currency }) {
  return (
    <ThemedText.Caption color="neutral1">
      <Trans>
        The fee paid to the Starknet network to process your transaction. This must be paid in {native.symbol}.
      </Trans>{' '}
    </ThemedText.Caption>
  )
}
