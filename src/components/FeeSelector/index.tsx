import { Trans } from '@lingui/macro'
import { FeePoolSelectAction, LiquidityEventName } from '@uniswap/analytics-events'
import { Currency } from '@uniswap/sdk-core'
import { FeeAmount } from '@uniswap/v3-sdk'
// import { useWeb3React } from '@web3-react/core'
import { sendAnalyticsEvent, useTrace } from 'analytics'
import { ButtonGray } from 'components/Button'
import Card from 'components/Card'
import { AutoColumn } from 'components/Column'
import { RowBetween } from 'components/Row'
import { useFeeTierDistribution } from 'hooks/useFeeTierDistribution'
import { PoolState, usePools } from 'hooks/usePools'
import usePrevious from 'hooks/usePrevious'
import { DynamicSection } from 'pages/AddLiquidity/styled'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Box } from 'rebass'
import styled, { keyframes } from 'styled-components'
import { ThemedText } from 'theme/components'

import { FeeOption } from './FeeOption'
import { FeeTierPercentageBadge } from './FeeTierPercentageBadge'
import { FEE_AMOUNT_DETAIL } from './shared'
import { useAccountDetails } from 'hooks/starknet-react'

const pulse = (color: string) => keyframes`
  0% {
    box-shadow: 0 0 0 0 ${color};
  }

  70% {
    box-shadow: 0 0 0 2px ${color};
  }

  100% {
    box-shadow: 0 0 0 0 ${color};
  }
`
const FocusedOutlineCard = styled(Card)<{ pulsing: boolean }>`
  border: 1px solid ${({ theme }) => theme.surface3};
  animation: ${({ pulsing, theme }) => pulsing && pulse(theme.accent1)} 0.6s linear;
  align-self: center;
`

const Select = styled.div`
  align-items: flex-start;
  display: grid;
  grid-auto-flow: column;
  grid-gap: 8px;
`

export default function FeeSelector({
  disabled = false,
  feeAmount,
  handleFeePoolSelect,
  currencyA,
  currencyB,
}: {
  disabled?: boolean
  feeAmount?: FeeAmount
  handleFeePoolSelect: (feeAmount: FeeAmount) => void
  currencyA?: Currency
  currencyB?: Currency
}) {
  const { chainId } = useAccountDetails()

  // const { isLoading, isError, largestUsageFeeTier } = useFeeTierDistribution(currencyA, currencyB)

  const distributions = {
    '100': 0.13230880019434835,
    '500': 58.77589559263296,
    '3000': 39.81891308283566,
    '10000': 1.272882524337048,
  }

  const poolsByFeeTier = {
    '100': 2,
    '500': 2,
    '3000': 2,
    '10000': 2,
  }

  const [showOptions, setShowOptions] = useState(true)
  const [pulsing, setPulsing] = useState(false)

  const previousFeeAmount = usePrevious(feeAmount)

  useEffect(() => {
    if (feeAmount && previousFeeAmount !== feeAmount) {
      setPulsing(true)
    }
  }, [previousFeeAmount, feeAmount])

  return (
    <AutoColumn gap="16px">
      <DynamicSection gap="md" disabled={disabled}>
        <FocusedOutlineCard pulsing={pulsing} onAnimationEnd={() => setPulsing(false)}>
          <RowBetween>
            <AutoColumn id="add-liquidity-selected-fee">
              {!feeAmount ? (
                <>
                  <ThemedText.DeprecatedLabel>
                    <Trans>Fee tier</Trans>
                  </ThemedText.DeprecatedLabel>
                  <ThemedText.DeprecatedMain fontWeight={485} fontSize="12px" textAlign="left">
                    <Trans>The % you will earn in fees.</Trans>
                  </ThemedText.DeprecatedMain>
                </>
              ) : (
                <>
                  <ThemedText.DeprecatedLabel className="selected-fee-label">
                    <Trans>{FEE_AMOUNT_DETAIL[feeAmount].label}% fee tier</Trans>
                  </ThemedText.DeprecatedLabel>
                  {/* <Box style={{ width: 'fit-content', marginTop: '8px' }} className="selected-fee-percentage">
                    {distributions && (
                      <FeeTierPercentageBadge
                        distributions={distributions}
                        feeAmount={feeAmount}
                        poolState={poolsByFeeTier[feeAmount]}
                      />
                    )}
                  </Box> */}
                </>
              )}
            </AutoColumn>

            <ButtonGray onClick={() => setShowOptions(!showOptions)} width="auto" padding="4px" $borderRadius="6px">
              {showOptions ? <Trans>Hide</Trans> : <Trans>Edit</Trans>}
            </ButtonGray>
          </RowBetween>
        </FocusedOutlineCard>

        {chainId && showOptions && (
          <Select>
            {[FeeAmount.LOWEST, FeeAmount.LOW, FeeAmount.MEDIUM, FeeAmount.HIGH].map((_feeAmount, i) => {
              return (
                <FeeOption
                  feeAmount={_feeAmount}
                  active={feeAmount === _feeAmount}
                  onClick={() => handleFeePoolSelect(_feeAmount)}
                  distributions={distributions}
                  poolState={poolsByFeeTier[_feeAmount]}
                  key={i}
                />
              )
            })}
          </Select>
        )}
      </DynamicSection>
    </AutoColumn>
  )
}
