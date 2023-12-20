import { ChainId } from '@vnaysn/jediswap-sdk-core'
import FACTORY_ABI from './abi.json'

//change ABI and Contracts

const FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0xdad44c139a476c7a17fc8141e6db680e9abc9f56fe249a105094c44382c2fd',
  [ChainId.GOERLI]: '0x06d394e77603407976810011a263ed7c040dc369ade2344a75b1caeb47625a4d',
}

export { FACTORY_ABI, FACTORY_ADDRESS }
