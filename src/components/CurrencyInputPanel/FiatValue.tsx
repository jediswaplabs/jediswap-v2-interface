import { Trans } from '@lingui/macro'
import { Percent } from '@vnaysn/jediswap-sdk-core'
import { useMemo } from 'react'
import styled from 'styled-components'

import Row from 'components/Row'
import { LoadingBubble } from 'components/Tokens/loading'
import { MouseoverTooltip } from 'components/Tooltip'
import { ThemedText } from 'theme/components'
import { NumberType, useFormatter } from 'utils/formatNumbers'
import { warningSeverity } from 'utils/prices'

const USDPriceContainer = styled.div`
  display: flex;
`

const USDPriceDifferenceText = styled.div<{ difference: number }>`
  color: ${({ difference }) => (difference > 0 ? 'green' : 'red')};
  margin-left: 2px;
`

export function FiatValue({ fiatValue, usdPriceDifference }: { fiatValue: number; usdPriceDifference?: number }) {
  const { formatNumber } = useFormatter()

  return (
    <Row gap="sm">
      <ThemedText.LabelSmall color="neutral1">
        {fiatValue ? (
          <USDPriceContainer>
            {formatNumber({ input: fiatValue, type: NumberType.FiatTokenPrice })}{' '}
            {usdPriceDifference && (
              <USDPriceDifferenceText difference={usdPriceDifference}>({usdPriceDifference}%)</USDPriceDifferenceText>
            )}
          </USDPriceContainer>
        ) : (
          <MouseoverTooltip text={<Trans>Not enough liquidity to show accurate USD value.</Trans>}>-</MouseoverTooltip>
        )}
      </ThemedText.LabelSmall>
      {/* {priceImpact && (
        <ThemedText.BodySmall color={priceImpactColor}>
          <MouseoverTooltip
            text={<Trans>The estimated difference between the USD values of input and output amounts.</Trans>}
          >
            (<Trans>{formatPercent(priceImpact.multiply(-1))}</Trans>)
          </MouseoverTooltip>
        </ThemedText.BodySmall>
      )} */}
    </Row>
  )
}
