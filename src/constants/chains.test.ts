import { ChainId } from '@vnaysn/jediswap-sdk-core'

import { getChainPriority } from './chains'

// Define an array of test cases with chainId and expected priority
const chainPriorityTestCases: [ChainId, number][] = [
  [ChainId.MAINNET, 0],
  [ChainId.GOERLI, 0],
  [ChainId.MAINNET, 0],
  [ChainId.MAINNET, 1],
  [ChainId.MAINNET, 1],
  [ChainId.MAINNET, 2],
  [ChainId.MAINNET, 2],
  [ChainId.MAINNET, 3],
  [ChainId.MAINNET, 3],
  [ChainId.MAINNET, 4],
  [ChainId.MAINNET, 5],
  [ChainId.MAINNET, 6],
  [ChainId.MAINNET, 7],
  [ChainId.MAINNET, 7],
]

test.each(chainPriorityTestCases)(
  'getChainPriority returns expected priority for a given ChainId %O',
  (chainId: ChainId, expectedPriority: number) => {
    const priority = getChainPriority(chainId)
    expect(priority).toBe(expectedPriority)
  }
)
