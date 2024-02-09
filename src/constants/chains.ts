import { ChainId } from '@vnaysn/jediswap-sdk-core'

export const CHAIN_IDS_TO_NAMES = {
  [ChainId.MAINNET]: 'mainnet',
  [ChainId.GOERLI]: 'goerli',
} as const

// Include ChainIds in this array if they are not supported by the UX yet, but are already in the SDK.

export function isSupportedChain(
  chainId: ChainId | null | undefined | ChainId,
  featureFlags?: Record<number, boolean>
) {
  return true
}

export const SUPPORTED_GAS_ESTIMATE_CHAIN_IDS = [ChainId.MAINNET] as const

/**
 * Supported networks for V2 pool behavior.
 */
export const SUPPORTED_V2POOL_CHAIN_IDS = [ChainId.MAINNET, ChainId.GOERLI] as const

export const TESTNET_CHAIN_IDS = [ChainId.GOERLI] as const

/**
 * All the chain IDs that are running the Ethereum protocol.
 */
export const L1_CHAIN_IDS = [ChainId.MAINNET, ChainId.GOERLI] as const

export type SupportedL1ChainId = (typeof L1_CHAIN_IDS)[number]

/**
 * Get the priority of a chainId based on its relevance to the user.
 * @param {ChainId} chainId - The chainId to determine the priority for.
 * @returns {number} The priority of the chainId, the lower the priority, the earlier it should be displayed, with base of MAINNET=0.
 */
export function getChainPriority(chainId: ChainId): number {
  switch (chainId) {
    case ChainId.MAINNET:
    case ChainId.GOERLI:
      return 0
    default:
      return 8
  }
}

export function isUniswapXSupportedChain(chainId: ChainId) {
  return chainId === ChainId.MAINNET
}
