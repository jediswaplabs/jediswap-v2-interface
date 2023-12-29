import { jsonRpcProvider } from '@starknet-react/core'
import { isLocalEnvironment } from 'connectors'

const provider = jsonRpcProvider({
  rpc: (chain) => {
    let nodeUrl = 'https://rpc.starknet-testnet.lava.build/'
    if (isLocalEnvironment()) {
      nodeUrl = 'https://rpc.starknet.lava.build/'
    } else if (chain.network === 'mainnet') {
      nodeUrl = 'https://rpc-proxy.jediswap.xyz/api/'
    }

    return {
      nodeUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  },
})

export default provider
