import { ChainId } from '@vnaysn/jediswap-sdk-core'

import REFERRAL_ABI from './abi.json'

// change ABI and Contracts

const REFERRAL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x7d6d06a46ed9c270254f5ac7c02792b8acfd08e7b4d102ef3ac3de4fb972b6f',
  [ChainId.GOERLI]: '0x7d6d06a46ed9c270254f5ac7c02792b8acfd08e7b4d102ef3ac3de4fb972b6f',
}

export { REFERRAL_ABI, REFERRAL_ADDRESS }
