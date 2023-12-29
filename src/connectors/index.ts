import { WebWalletConnector } from '@argent/starknet-react-webwallet-connector'
import { InjectedConnector } from '@starknet-react/core'
import { ChainId } from '@vnaysn/jediswap-sdk-core'

export const NETWORK_CHAIN_ID: number = parseInt(process.env.REACT_APP_CHAIN_ID ?? '5')

export const isTestnetEnvironment = () => {
  if (!location) {
    return false
  }
  if (String(location) === '//') {
    return false
  }
  const host = new URL(String(location))?.host || ''
  return host === 'testnet.e2.jediswap.xyz'
}

export const isStagingEnvironment = () => {
  if (!location) {
    return false
  }
  if (String(location) === '//') {
    return false
  }
  const host = new URL(String(location))?.host || ''
  // TODO JediSwap replace with new address once the migration is over
  return host === 'staging.e2.jediswap.xyz'
}

export const isProductionEnvironment = () => {
  if (!location) {
    return false
  }
  if (String(location) === '//') {
    return false
  }
  const host = new URL(String(location))?.host || ''
  // TODO JediSwap replace with new address once the migration is over
  return host === 'app.e2.jediswap.xyz'
}

export const isLocalEnvironment = () => {
  if (!location) {
    return false
  }
  if (String(location) === '//') {
    return false
  }
  const hostname = new URL(String(location))?.hostname || ''
  return hostname === 'localhost'
}

export const isProductionChainId = (id: ChainId | null | undefined) => id === ChainId.MAINNET

export const isTestnetChainId = (id: ChainId | null | undefined) => id === ChainId.GOERLI

export const webWalletUrl = isTestnetEnvironment() ? 'https://web.hydrogen.argent47.net/' : 'https://web.argent.xyz/'

export const argentX = new InjectedConnector({ options: { id: 'argentX' } })
export const braavosWallet = new InjectedConnector({ options: { id: 'braavos' } })
export const argentWebWallet = new WebWalletConnector({
  url: webWalletUrl
})

export type injectedConnector = 'argentX' | 'braavos'
