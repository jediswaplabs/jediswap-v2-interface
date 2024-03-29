import { useAccountDetails } from 'hooks/starknet-react'
import styled from 'styled-components'

import { Gas } from 'components/Icons/Gas'
import { LoadingOpacityContainer } from 'components/Loader/styled'
import Row, { RowFixed } from 'components/Row'
import { SubmittableTrade } from 'state/routing/types'
import { ThemedText } from 'theme/components'
import { NumberType, useFormatter } from 'utils/formatNumbers'

const StyledGasIcon = styled(Gas)`
  height: 16px;
  width: 16px;
  margin-right: 4px;
  // We apply the following to all children of the SVG in order to override the default color
  & > * {
    fill: ${({ theme }) => theme.neutral1};
  }
`

export default function GasEstimateTooltip({ trade, loading }: { trade?: SubmittableTrade; loading: boolean }) {
  const { chainId } = useAccountDetails()
  const { formatNumber } = useFormatter()

  if (!trade || !chainId) {
    return null
  }

  return (
    <LoadingOpacityContainer $loading={loading}>
      <RowFixed gap="xs">
        <StyledGasIcon />
        <ThemedText.BodySmall color="neutral1">
          <Row gap="xs">
            <div>
              {/* {formatNumber({
                input: trade.totalGasUseEstimateUSD,
                type: NumberType.FiatGasPrice,
              })} */}
            </div>
          </Row>
        </ThemedText.BodySmall>
      </RowFixed>
    </LoadingOpacityContainer>
  )
}
