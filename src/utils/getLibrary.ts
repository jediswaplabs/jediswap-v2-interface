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

    let nodeUrl = 'https://rpc.starknet-testnet.lava.build/'
    if (chainType === 'sepolia') {
      nodeUrl = 'https://api-starknet-sepolia.dwellir.com/5d261670-e8d7-417d-9873-f721ab91ef04'
    } else if (chainType === 'mainnet') {
      nodeUrl = 'https://api-starknet-mainnet.dwellir.com/5d261670-e8d7-417d-9873-f721ab91ef04'
    } else if (chainType === 'goerli') {
      nodeUrl = 'https://rpc.starknet-testnet.lava.build/'
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
        ? 'https://api-starknet-sepolia.dwellir.com/5d261670-e8d7-417d-9873-f721ab91ef04'
        : 'https://api-starknet-mainnet.dwellir.com/5d261670-e8d7-417d-9873-f721ab91ef04',
  })
}

export default provider
