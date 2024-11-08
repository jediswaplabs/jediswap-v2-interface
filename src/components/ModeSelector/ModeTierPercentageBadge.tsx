import { Trans } from '@lingui/macro'
import { FeeAmount } from '@vnaysn/jediswap-sdk-v3'
import Badge from 'components/Badge'
import { useFeeTierDistribution } from 'hooks/useFeeTierDistribution'
import { PoolState } from 'hooks/usePools'
import React from 'react'
import { ThemedText } from 'theme/components'

export function ModeTierPercentageBadge({
  feeAmount,
  distributions,
  poolState,
}: {
  feeAmount: FeeAmount
  distributions: ReturnType<typeof useFeeTierDistribution>['distributions']
  poolState: PoolState
}) {
  return (
    <Badge style={{ backgroundColor: '#444', borderRadius: '4px', padding: '4px' }}>
      <ThemedText.DeprecatedLabel fontSize={10} lineHeight={1}>
        {!distributions || poolState === PoolState.NOT_EXISTS || poolState === PoolState.INVALID ? (
          <Trans>Not created</Trans>
        ) : distributions[feeAmount] !== undefined ? (
          <Trans>{distributions[feeAmount]?.toFixed(0)} select</Trans>
        ) : (
          <Trans>No data</Trans>
        )}
      </ThemedText.DeprecatedLabel>
    </Badge>
  )
}
