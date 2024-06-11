import { ChainId } from '@vnaysn/jediswap-sdk-core'

import REFERRAL_ABI from './abi.json'

// change ABI and Contracts

const REFERRAL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x02da52b8745fd5f6c83dd9e375de4a18fa625a38ac2891b4c2822f5b669398ad',
  [ChainId.GOERLI]: '0x02da52b8745fd5f6c83dd9e375de4a18fa625a38ac2891b4c2822f5b669398ad',
}

export { REFERRAL_ABI, REFERRAL_ADDRESS }
