import { ChainId } from '@vnaysn/jediswap-sdk-core'

import REFERRAL_ABI from './abi.json'

// change ABI and Contracts

const REFERRAL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x42d44d96b632dd6fd362e3a49ec3ab66b6a0bf69d14f8311d235e8af3982873',
  [ChainId.GOERLI]: '0x42d44d96b632dd6fd362e3a49ec3ab66b6a0bf69d14f8311d235e8af3982873',
}

export { REFERRAL_ABI, REFERRAL_ADDRESS }
