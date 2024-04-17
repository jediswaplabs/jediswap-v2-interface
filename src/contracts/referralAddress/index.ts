import { ChainId } from '@vnaysn/jediswap-sdk-core'

import REFERRAL_ABI from './abi.json'

// change ABI and Contracts

const REFERRAL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x247b0a6a2170b2891280f36488220a57f7fe5446ae0d13c4fe883fc29c3cf8a',
  [ChainId.GOERLI]: '0x247b0a6a2170b2891280f36488220a57f7fe5446ae0d13c4fe883fc29c3cf8a',
}

export { REFERRAL_ABI, REFERRAL_ADDRESS }
