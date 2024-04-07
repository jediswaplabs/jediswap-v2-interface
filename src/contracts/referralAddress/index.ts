import { ChainId } from '@vnaysn/jediswap-sdk-core'

import REFERRAL_ABI from './abi.json'

// change ABI and Contracts

const REFERRAL_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x798041fdd7ea502a9bd8cb06cff254369b452be2a5d3d022cb12e2b78db4472',
  [ChainId.SEPOLIA]: '0x798041fdd7ea502a9bd8cb06cff254369b452be2a5d3d022cb12e2b78db4472',
  [ChainId.GOERLI]: '0x798041fdd7ea502a9bd8cb06cff254369b452be2a5d3d022cb12e2b78db4472',
}

export { REFERRAL_ABI, REFERRAL_ADDRESS }
