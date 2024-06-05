import { ChainId } from '@vnaysn/jediswap-sdk-core'

import REFERRAL_ABI from './abi.json'

// change ABI and Contracts

const REFERRAL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x040fe6f6c1b38d8b5f92b095249f8523bb96392abbcb6a0392d397171a936264',
  [ChainId.GOERLI]: '0x040fe6f6c1b38d8b5f92b095249f8523bb96392abbcb6a0392d397171a936264',
}

export { REFERRAL_ABI, REFERRAL_ADDRESS }
