import { jsonRpcProvider } from '@starknet-react/core'
import { ChainId } from '@vnaysn/jediswap-sdk-core'
import { RpcProvider } from 'starknet'

interface NetworkTypes {
  [key: string]: string
}

const networks: NetworkTypes = {
  Starknet: 'mainnet',
  'Starknet Goerli Testnet': 'goerli',
  'Starknet Sepolia Testnet': 'sepolia',
}

const provider = jsonRpcProvider({
  rpc: (chain) => {
    const chainType: string = networks[chain.name]

    let nodeUrl = 'https://api-starknet-mainnet.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c'
    if (chainType === 'sepolia') {
      nodeUrl = 'https://api-starknet-sepolia.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c'
    }

    return {
      nodeUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  },
})

export const providerInstance = (chainId: string) => {
  return new RpcProvider({
    nodeUrl:
      chainId === ChainId.GOERLI
        ? 'https://api-starknet-sepolia.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c'
        : 'https://api-starknet-mainnet.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c',
  })
}

export default provider
