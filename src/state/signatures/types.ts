import { UniswapXOrderStatus } from 'lib/hooks/orders/types'

import { ExactInputSwapTransactionInfo, ExactOutputSwapTransactionInfo } from '../transactions/types'
import { ChainId } from '@vnaysn/jediswap-sdk-core'

export enum SignatureType {
  SIGN_UNISWAPX_ORDER = 'signUniswapXOrder',
}

interface BaseSignatureFields {
  type: SignatureType
  id: string
  addedTime: number
  chainId: ChainId
  expiry: number
  offerer: string
}

export interface UniswapXOrderDetails extends BaseSignatureFields {
  type: SignatureType.SIGN_UNISWAPX_ORDER
  orderHash: string
  status: UniswapXOrderStatus
  swapInfo: (ExactInputSwapTransactionInfo | ExactOutputSwapTransactionInfo) & { isUniswapXOrder: true }
  txHash?: string
}

export type SignatureDetails = UniswapXOrderDetails
