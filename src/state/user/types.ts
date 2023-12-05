import { ChainId } from '@vnaysn/jediswap-sdk-core'
export interface SerializedToken {
  chainId: ChainId
  address: string
  decimals: number
  symbol?: string
  name?: string
}

export interface SerializedPair {
  token0: SerializedToken
  token1: SerializedToken
}

export enum SlippageTolerance {
  Auto = 'auto',
}
