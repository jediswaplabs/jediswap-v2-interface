import { Trans } from '@lingui/macro'
import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { FeeAmount } from '@vnaysn/jediswap-sdk-v3'
import { SUPPORTED_CHAINS } from 'constants/addresses'
import type { ReactNode } from 'react'

export const FEE_AMOUNT_DETAIL: Record<
  FeeAmount,
  { label: string; description: ReactNode; supportedChains: readonly ChainId[] }
> = {
  [FeeAmount.LOWEST]: {
    label: 'Dynamic Mode',
    description: <Trans>Rebalances in both directions</Trans>,
    supportedChains: SUPPORTED_CHAINS,
  },
  [FeeAmount.LOW]: {
    label: 'Bear Mode',
    description: <Trans>Rebalances when token0 goes down</Trans>,
    supportedChains: SUPPORTED_CHAINS,
  },
  [FeeAmount.MEDIUM]: {
    label: 'Bull Mode',
    description: <Trans>Rebalances when token0 goes up</Trans>,
    supportedChains: [ChainId.MAINNET],
  },
  [FeeAmount.HIGH]: {
    label: 'Static Mode',
    description: <Trans>No rebalances</Trans>,
    supportedChains: SUPPORTED_CHAINS,
  },
}
