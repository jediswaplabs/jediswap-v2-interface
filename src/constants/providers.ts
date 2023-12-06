import { ChainId } from '@vnaysn/jediswap-sdk-core'
import AppRpcProvider from 'rpc/AppRpcProvider'
import AppStaticJsonRpcProvider from 'rpc/StaticJsonRpcProvider'
import StaticJsonRpcProvider from 'rpc/StaticJsonRpcProvider'

import { RPC_URLS } from './networks'

const providerFactory = (chainId: ChainId, i = 0) => new AppStaticJsonRpcProvider(chainId, RPC_URLS[chainId][i])

/**
 * These are the only JsonRpcProviders used directly by the interface.
 */
export const RPC_PROVIDERS: { [key in ChainId]: StaticJsonRpcProvider } = {
  [ChainId.MAINNET]: new AppRpcProvider(ChainId.MAINNET, [
    providerFactory(ChainId.MAINNET),
    providerFactory(ChainId.MAINNET, 1),
  ]),
  [ChainId.GOERLI]: providerFactory(ChainId.GOERLI),
}

export const DEPRECATED_RPC_PROVIDERS: { [key in ChainId]: AppStaticJsonRpcProvider } = {
  [ChainId.MAINNET]: providerFactory(ChainId.MAINNET),
  [ChainId.GOERLI]: providerFactory(ChainId.GOERLI),
}
