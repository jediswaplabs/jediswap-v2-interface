// import { Trans } from '@lingui/macro'
import { ChainId, SUPPORTED_CHAINS } from "@uniswap/sdk-core";
import { FeeAmount } from "@uniswap/v3-sdk";
import type { ReactNode } from "react";

export const FEE_AMOUNT_DETAIL: Record<
  FeeAmount,
  { label: string; description: ReactNode; supportedChains: readonly ChainId[] }
> = {
  [FeeAmount.LOWEST]: {
    label: "0.01",
    description: <>Best for very stable pairs.</>,
    supportedChains: [
      ChainId.ARBITRUM_ONE,
      ChainId.BNB,
      ChainId.CELO,
      ChainId.CELO_ALFAJORES,
      ChainId.MAINNET,
      ChainId.OPTIMISM,
      ChainId.POLYGON,
      ChainId.POLYGON_MUMBAI,
      ChainId.AVALANCHE,
      ChainId.BASE
    ]
  },
  [FeeAmount.LOW]: {
    label: "0.05",
    description: <>Best for stable pairs.</>,
    supportedChains: SUPPORTED_CHAINS
  },
  [FeeAmount.MEDIUM]: {
    label: "0.3",
    description: <>Best for most pairs.</>,
    supportedChains: SUPPORTED_CHAINS
  },
  [FeeAmount.HIGH]: {
    label: "1",
    description: <>Best for exotic pairs.</>,
    supportedChains: SUPPORTED_CHAINS
  }
};
