import { ChainId } from '@vnaysn/jediswap-sdk-core'
import ROUTER_ABI from './abi.json'

//update abi

const ROUTER_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x41fd22b238fa21cfcf5dd45a8548974d8263b3a531a60388411c5e230f97023',
  [ChainId.GOERLI]: '0x2bcc885342ebbcbcd170ae6cafa8a4bed22bb993479f49806e72d96af94c965',
}

export { ROUTER_ABI, ROUTER_ADDRESS }
