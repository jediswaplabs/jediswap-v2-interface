// @ts-nocheck

'use client'
import React, { useMemo, useState } from 'react'

import { goerli, mainnet, sepolia } from '@starknet-react/chains'
import { StarknetConfig } from '@starknet-react/core'
import rpcProvider from 'utils/getLibrary'
import { isTestnetEnvironment } from 'connectors'
import { getStarknet } from 'get-starknet-core'
import { InjectedConnector } from 'starknetkit/injected'
import { WebWalletConnector } from 'starknetkit/webwallet'
import { ArgentMobileConnector } from 'starknetkit/argentMobile'
import { constants, RpcProvider } from 'starknet'
const isTestnet = isTestnetEnvironment()
const wallets = getStarknet()
const hasOKX = isTestnet
  ? false
  : wallets.getAvailableWallets().then((wallets) => wallets.filter((wallet) => wallet.name.includes('OKX')).length > 0)

export const connectors = [
  new InjectedConnector({ options: { id: 'braavos', name: 'Braavos' } }),
  new InjectedConnector({ options: { id: 'argentX', name: 'Argent X' } }),
  // ...(hasOKX ? [new InjectedConnector({ options: { id: 'okxwallet', name: 'OKX' } })] : []),
  // new WebWalletConnector({
  //   url: isTestnet ? 'https://web.hydrogen.argent47.net' : 'https://web.argent.xyz/',
  //   provider: new RpcProvider({
  //     nodeUrl: 'https://api-starknet-mainnet.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c',
  //   }),
  // }),
  // new ArgentMobileConnector({
  //   projectId: '4b1e5f71ad6f3397afaf5cf19d816ca2',
  //   dappName: 'Jediswap Interface',
  //   chainId: constants.NetworkName.SN_MAIN,
  //   icons: ['https://app.jediswap.xyz/favicon/apple-touch-icon.png'],
  //   rpcUrl: 'https://api-starknet-mainnet.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c',
  // }),
]

// export const useAvailableConnectors = () => {
//   // const [hasOKX, setHasOKX] = useState<boolean>(false)
//   const isTestnet = isTestnetEnvironment()

//   // Check if OKX wallet is injected in the user browser, if so we'll add it in the list of connectors
//   // To remove once discovery links for OKX are added in get-starknet-core lib
//   const hasOKX = useMemo(() => {
//     if (isTestnet) {
//       return false
//     }
//     const wallets = getStarknet()
//     return wallets
//       .getAvailableWallets()
//       .then((wallets) => wallets.filter((wallet) => wallet.name.includes('OKX')).length > 0)
//   }, [isTestnet])

//   return useMemo(
//     () => [
//       new InjectedConnector({ options: { id: 'braavos', name: 'Braavos' } }),
//       new InjectedConnector({ options: { id: 'argentX', name: 'Argent X' } }),
//       ...(hasOKX ? [new InjectedConnector({ options: { id: 'okxwallet', name: 'OKX' } })] : []),
//       // new WebWalletConnector({
//       //   url: isTestnet ? 'https://web.hydrogen.argent47.net' : 'https://web.argent.xyz/',
//       // }),
//       new ArgentMobileConnector({
//         projectId: '4b1e5f71ad6f3397afaf5cf19d816ca2',
//         dappName: 'Jediswap Interface',
//         chainId: 'SN_MAIN',
//         icons: ['https://app.jediswap.xyz/favicon/apple-touch-icon.png'],
//       }),
//     ],
//     [hasOKX]
//   )
// }

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const chains = [mainnet, goerli, sepolia]

  // const connectors = useAvailableConnectors()

  return (
    <StarknetConfig chains={chains} connectors={connectors} provider={rpcProvider} autoConnect>
      {children}
    </StarknetConfig>
  )
}
