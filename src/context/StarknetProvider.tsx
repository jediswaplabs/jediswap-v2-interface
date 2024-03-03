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

export const useAvailableConnectors = () => {
  // const [hasOKX, setHasOKX] = useState<boolean>(false)
  const isTestnet = isTestnetEnvironment()

  // Check if OKX wallet is injected in the user browser, if so we'll add it in the list of connectors
  // To remove once discovery links for OKX are added in get-starknet-core lib
  const hasOKX = useMemo(() => {
    if (isTestnet) {
      return false
    }
    const wallets = getStarknet()
    return wallets
      .getAvailableWallets()
      .then((wallets) => wallets.filter((wallet) => wallet.name.includes('OKX')).length > 0)
  }, [isTestnet])

  return useMemo(
    () => [
      new InjectedConnector({ options: { id: 'braavos', name: 'Braavos' } }),
      new InjectedConnector({ options: { id: 'argentX', name: 'Argent X' } }),
      ...(hasOKX ? [new InjectedConnector({ options: { id: 'okxwallet', name: 'OKX' } })] : []),
      // new WebWalletConnector({
      //   url: isTestnet ? 'https://web.hydrogen.argent47.net' : 'https://web.argent.xyz/',
      // }),
      // new ArgentMobileConnector({
      //   dappName: 'Jediswap Interface',
      //   icons: ['https://app.starknet.id/visuals/StarknetIdLogo.svg'],
      // }),
    ],
    [hasOKX]
  )
}

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const chains = [mainnet, goerli, sepolia]

  const connectors = useAvailableConnectors()

  return (
    <StarknetConfig chains={chains} connectors={connectors} provider={rpcProvider} autoConnect>
      {children}
    </StarknetConfig>
  )
}
