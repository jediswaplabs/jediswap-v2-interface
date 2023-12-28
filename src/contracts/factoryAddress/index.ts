import { ChainId } from '@vnaysn/jediswap-sdk-core'

import FACTORY_ABI from './abi.json'

// change ABI and Contracts

const FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x06262409329bff003489ccac5d548bb75d33c896e29ceb6a586084a266e094ff',
  [ChainId.GOERLI]: '0x06262409329bff003489ccac5d548bb75d33c896e29ceb6a586084a266e094ff'
}

export { FACTORY_ABI, FACTORY_ADDRESS }
