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
import { getBrowser } from 'utils/userAgent'
const isTestnet = isTestnetEnvironment()

export const connectors = [
  new InjectedConnector({ options: { id: 'braavos', name: 'Braavos' } }),
  new InjectedConnector({ options: { id: 'argentX', name: 'Argent X' } }),
  new InjectedConnector({ options: { id: 'okxwallet', name: 'OKX' } }),
  new WebWalletConnector({
    url: isTestnet ? 'https://web.hydrogen.argent47.net' : 'https://web.argent.xyz/',
    provider: new RpcProvider({
      nodeUrl: 'https://api-starknet-mainnet.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c',
    }),
  }),
  new ArgentMobileConnector({
    projectId: '4b1e5f71ad6f3397afaf5cf19d816ca2',
    dappName: 'Jediswap Interface',
    chainId: constants.NetworkName.SN_MAIN,
    icons: ['https://app.jediswap.xyz/favicon/apple-touch-icon.png'],
    rpcUrl: 'https://api-starknet-mainnet.dwellir.com/dd28e566-3260-4d8d-8180-6ef1a161e41c',
  }),
]

export const getConnectorIcon = (id: string) => {
  const walletData = wallets.find((wallet) => wallet.id === id)
  if (walletData) {
    return walletData.icon
  }
  return id
}

export const getConnectorName = (id: string) => {
  const walletData = wallets.find((wallet) => wallet.id === id)
  if (walletData) {
    return walletData.name
  }
  return id
}

export const getConnectorDiscovery = (id: string) => {
  const walletData = wallets.find((wallet) => wallet.id === id)

  if (!walletData || !walletData.website) return 'https://www.starknet-ecosystem.com' // if no website is found, return the ecosystem website

  if (walletData.downloads && typeof navigator !== 'undefined') {
    const browser = getBrowser(navigator.userAgent)
    return walletData.downloads[browser as keyof typeof walletData.downloads] ?? walletData.website
  }

  return walletData.website
}

export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const chains = [mainnet, goerli, sepolia]
  return (
    <StarknetConfig chains={chains} connectors={connectors} provider={rpcProvider} autoConnect>
      {children}
    </StarknetConfig>
  )
}

const wallets = [
  {
    id: 'argentX',
    name: 'Argent X',
    icon: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iYmxhY2siLz4KPHBhdGggZD0iTTE4LjQwMTggNy41NTU1NkgxMy41OTgyQzEzLjQzNzcgNy41NTU1NiAxMy4zMDkxIDcuNjg3NDcgMTMuMzA1NiA3Ljg1MTQzQzEzLjIwODUgMTIuNDYwMyAxMC44NDg0IDE2LjgzNDcgNi43ODYwOCAxOS45MzMxQzYuNjU3MTEgMjAuMDMxNCA2LjYyNzczIDIwLjIxNjIgNi43MjIwMiAyMC4zNDkzTDkuNTMyNTMgMjQuMzE5NkM5LjYyODE1IDI0LjQ1NDggOS44MTQ0NCAyNC40ODUzIDkuOTQ1NTggMjQuMzg2QzEyLjQ4NTYgMjIuNDYxMyAxNC41Mjg3IDIwLjEzOTUgMTYgMTcuNTY2QzE3LjQ3MTMgMjAuMTM5NSAxOS41MTQ1IDIyLjQ2MTMgMjIuMDU0NSAyNC4zODZDMjIuMTg1NiAyNC40ODUzIDIyLjM3MTkgMjQuNDU0OCAyMi40Njc2IDI0LjMxOTZMMjUuMjc4MSAyMC4zNDkzQzI1LjM3MjMgMjAuMjE2MiAyNS4zNDI5IDIwLjAzMTQgMjUuMjE0IDE5LjkzMzFDMjEuMTUxNiAxNi44MzQ3IDE4Ljc5MTUgMTIuNDYwMyAxOC42OTQ2IDcuODUxNDNDMTguNjkxMSA3LjY4NzQ3IDE4LjU2MjMgNy41NTU1NiAxOC40MDE4IDcuNTU1NTZaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjQuNzIzNiAxMC40OTJMMjQuMjIzMSA4LjkyNDM5QzI0LjEyMTMgOC42MDYxNCAyMy44NzM0IDguMzU4MjQgMjMuNTU3NyA4LjI2MDIzTDIyLjAwMzkgNy43NzU5NUMyMS43ODk1IDcuNzA5MDYgMjEuNzg3MyA3LjQwMTc3IDIyLjAwMTEgNy4zMzIwMUwyMy41NDY5IDYuODI0NjZDMjMuODYwOSA2LjcyMTQ2IDI0LjEwNiA2LjQ2OTUyIDI0LjIwMjcgNi4xNTAxMUwyNC42Nzk4IDQuNTc1MDJDMjQuNzQ1OCA0LjM1NzA5IDI1LjA0ODkgNC4zNTQ3NyAyNS4xMTgzIDQuNTcxNTZMMjUuNjE4OCA2LjEzOTE1QzI1LjcyMDYgNi40NTc0IDI1Ljk2ODYgNi43MDUzMSAyNi4yODQyIDYuODAzOUwyNy44MzggNy4yODc2MUMyOC4wNTI0IDcuMzU0NSAyOC4wNTQ3IDcuNjYxNzkgMjcuODQwOCA3LjczMjEzTDI2LjI5NSA4LjIzOTQ4QzI1Ljk4MTEgOC4zNDIxIDI1LjczNiA4LjU5NDA0IDI1LjYzOTMgOC45MTQwMkwyNS4xNjIxIDEwLjQ4ODVDMjUuMDk2MSAxMC43MDY1IDI0Ljc5MyAxMC43MDg4IDI0LjcyMzYgMTAuNDkyWiIgZmlsbD0id2hpdGUiLz4KPC9zdmc+Cg==`,
    downloads: {
      chrome: 'https://chrome.google.com/webstore/detail/argent-x-starknet-wallet/dlcobpjiigpikoobohmabehhmhfoodbb',
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/argent-x',
      edge: 'https://microsoftedge.microsoft.com/addons/detail/argent-x/ajcicjlkibolbeaaagejfhnofogocgcj',
    },
    website: 'https://www.argent.xyz/argent-x/',
  },
  {
    id: 'argentMobile',
    name: 'Argent (mobile)',
    icon: 'data:image/svg+xml;base64,PHN2ZwogICAgd2lkdGg9IjMyIgogICAgaGVpZ2h0PSIzMiIKICAgIHZpZXdCb3g9IjAgMCAzMiAzMiIKICAgIGZpbGw9Im5vbmUiCiAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgPgogICAgPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iI0ZGODc1QiIgLz4KICAgIDxwYXRoCiAgICAgIGQ9Ik0xOC4zMTYgOEgxMy42ODRDMTMuNTI5MiA4IDEzLjQwNTIgOC4xMjcyIDEzLjQwMTggOC4yODUzMUMxMy4zMDgyIDEyLjcyOTYgMTEuMDMyMyAxNi45NDc3IDcuMTE1MTMgMTkuOTM1NUM2Ljk5MDc3IDIwLjAzMDMgNi45NjI0MyAyMC4yMDg1IDcuMDUzMzUgMjAuMzM2OUw5Ljc2MzQ5IDI0LjE2NTRDOS44NTU2OSAyNC4yOTU3IDEwLjAzNTMgMjQuMzI1MSAxMC4xNjE4IDI0LjIyOTRDMTIuNjExMSAyMi4zNzM0IDE0LjU4MTIgMjAuMTM0NSAxNiAxNy42NTI5QzE3LjQxODcgMjAuMTM0NSAxOS4zODkgMjIuMzczNCAyMS44MzgzIDI0LjIyOTRDMjEuOTY0NiAyNC4zMjUxIDIyLjE0NDMgMjQuMjk1NyAyMi4yMzY2IDI0LjE2NTRMMjQuOTQ2NyAyMC4zMzY5QzI1LjAzNzUgMjAuMjA4NSAyNS4wMDkyIDIwLjAzMDMgMjQuODg1IDE5LjkzNTVDMjAuOTY3NiAxNi45NDc3IDE4LjY5MTggMTIuNzI5NiAxOC41OTgzIDguMjg1MzFDMTguNTk0OSA4LjEyNzIgMTguNDcwOCA4IDE4LjMxNiA4WiIKICAgICAgZmlsbD0id2hpdGUiCiAgICAvPgogIDwvc3ZnPg==',
    website: 'https://www.argent.xyz/argent-x/',
  },
  {
    id: 'argentWebWallet',
    name: 'Email',
    icon: 'data:image/svg+xml;base64,PHN2Zwp3aWR0aD0iMzIiCmhlaWdodD0iMjgiCnZpZXdCb3g9IjAgMCAxOCAxNCIKZmlsbD0ibm9uZSIKeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgo+CjxwYXRoCiAgZmlsbC1ydWxlPSJldmVub2RkIgogIGNsaXAtcnVsZT0iZXZlbm9kZCIKICBkPSJNMS41IDAuNDM3NUMwLjk4MjIzMyAwLjQzNzUgMC41NjI1IDAuODU3MjMzIDAuNTYyNSAxLjM3NVYxMkMwLjU2MjUgMTIuNDE0NCAwLjcyNzEyIDEyLjgxMTggMS4wMjAxNSAxMy4xMDQ5QzEuMzEzMTcgMTMuMzk3OSAxLjcxMDYgMTMuNTYyNSAyLjEyNSAxMy41NjI1SDE1Ljg3NUMxNi4yODk0IDEzLjU2MjUgMTYuNjg2OCAxMy4zOTc5IDE2Ljk3OTkgMTMuMTA0OUMxNy4yNzI5IDEyLjgxMTggMTcuNDM3NSAxMi40MTQ0IDE3LjQzNzUgMTJWMS4zNzVDMTcuNDM3NSAwLjg1NzIzMyAxNy4wMTc4IDAuNDM3NSAxNi41IDAuNDM3NUgxLjVaTTIuNDM3NSAzLjUwNjE2VjExLjY4NzVIMTUuNTYyNVYzLjUwNjE2TDkuNjMzNDkgOC45NDEwOEM5LjI3NTA3IDkuMjY5NjQgOC43MjQ5MyA5LjI2OTY0IDguMzY2NTEgOC45NDEwOEwyLjQzNzUgMy41MDYxNlpNMTQuMDg5OSAyLjMxMjVIMy45MTAxM0w5IDYuOTc4MjJMMTQuMDg5OSAyLjMxMjVaIgogIGZpbGw9ImN1cnJlbnRDb2xvciIKLz4KPC9zdmc+',
    website: 'https://www.argent.xyz/argent-x/',
  },
  {
    id: 'braavos',
    name: 'Braavos',
    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgICA8cGF0aAogICAgICAgIGQ9Ik02Mi43MDUgMTMuOTExNkM2Mi44MzU5IDE0LjEzMzMgNjIuNjYyMSAxNC40MDcgNjIuNDAzOSAxNC40MDdDNTcuMTgwNyAxNC40MDcgNTIuOTM0OCAxOC41NDI3IDUyLjgzNTEgMjMuNjgxN0M1MS4wNDY1IDIzLjM0NzcgNDkuMTkzMyAyMy4zMjI2IDQ3LjM2MjYgMjMuNjMxMUM0Ny4yMzYxIDE4LjUxNTYgNDMuMDAwOSAxNC40MDcgMzcuNzk0OCAxNC40MDdDMzcuNTM2NSAxNC40MDcgMzcuMzYyNSAxNC4xMzMxIDM3LjQ5MzUgMTMuOTExMkM0MC4wMjE3IDkuNjI4MDkgNDQuNzIwNCA2Ljc1IDUwLjA5OTEgNi43NUM1NS40NzgxIDYuNzUgNjAuMTc2OSA5LjYyODI2IDYyLjcwNSAxMy45MTE2WiIKICAgICAgICBmaWxsPSJ1cmwoI3BhaW50MF9saW5lYXJfMzcyXzQwMjU5KSIgLz4KICAgIDxwYXRoCiAgICAgICAgZD0iTTc4Ljc2MDYgNDUuODcxOEM4MC4yNzI1IDQ2LjMyOTcgODEuNzAyNSA0NS4wMDU1IDgxLjE3MTQgNDMuNTIyMkM3Ni40MTM3IDMwLjIzMzQgNjEuMzkxMSAyNC44MDM5IDUwLjAyNzcgMjQuODAzOUMzOC42NDQyIDI0LjgwMzkgMjMuMjg2OCAzMC40MDcgMTguODc1NCA0My41OTEyQzE4LjM4MjQgNDUuMDY0NSAxOS44MDgzIDQ2LjM0NDYgMjEuMjk3OCA0NS44ODgxTDQ4Ljg3MiAzNy40MzgxQzQ5LjUzMzEgMzcuMjM1NSA1MC4yMzk5IDM3LjIzNDQgNTAuOTAxNyAzNy40MzQ4TDc4Ljc2MDYgNDUuODcxOFoiCiAgICAgICAgZmlsbD0idXJsKCNwYWludDFfbGluZWFyXzM3Ml80MDI1OSkiIC8+CiAgICA8cGF0aAogICAgICAgIGQ9Ik0xOC44MTMyIDQ4LjE3MDdMNDguODkzNSAzOS4wNDcyQzQ5LjU1MDYgMzguODQ3OCA1MC4yNTI0IDM4Ljg0NzMgNTAuOTA5OCAzOS4wNDU2TDgxLjE3ODEgNDguMTc1MkM4My42OTEyIDQ4LjkzMzIgODUuNDExIDUxLjI0ODMgODUuNDExIDUzLjg3MzVWODEuMjIzM0M4NS4yOTQ0IDg3Ljg5OTEgNzkuMjk3NyA5My4yNSA3Mi42MjQ1IDkzLjI1SDYxLjU0MDZDNjAuNDQ0OSA5My4yNSA1OS41NTc3IDkyLjM2MzcgNTkuNTU3NyA5MS4yNjhWODEuNjc4OUM1OS41NTc3IDc3LjkwMzEgNjEuNzkyMSA3NC40ODU1IDY1LjI0OTggNzIuOTcyOUM2OS44ODQ5IDcwLjk0NTQgNzUuMzY4MSA2OC4yMDI4IDc2LjM5OTQgNjIuNjk5MkM3Ni43MzIzIDYwLjkyMjkgNzUuNTc0MSA1OS4yMDk0IDczLjgwMjQgNTguODU3M0M2OS4zMjI2IDU3Ljk2NjcgNjQuMzU2MiA1OC4zMTA3IDYwLjE1NjQgNjAuMTg5M0M1NS4zODg3IDYyLjMyMTkgNTQuMTQxNSA2NS44Njk0IDUzLjY3OTcgNzAuNjMzN0w1My4xMjAxIDc1Ljc2NjJDNTIuOTQ5MSA3Ny4zMzQ5IDUxLjQ3ODUgNzguNTM2NiA0OS45MDE0IDc4LjUzNjZDNDguMjY5OSA3OC41MzY2IDQ3LjA0NjUgNzcuMjk0IDQ2Ljg2OTYgNzUuNjcxMkw0Ni4zMjA0IDcwLjYzMzdDNDUuOTI0OSA2Ni41NTI5IDQ1LjIwNzkgNjIuNTg4NyA0MC45ODk1IDYwLjcwMThDMzYuMTc3NiA1OC41NDk0IDMxLjM0MTkgNTcuODM0NyAyNi4xOTc2IDU4Ljg1NzNDMjQuNDI2IDU5LjIwOTQgMjMuMjY3OCA2MC45MjI5IDIzLjYwMDcgNjIuNjk5MkMyNC42NDEgNjguMjUwNyAzMC4wODEyIDcwLjkzMDUgMzQuNzUwMyA3Mi45NzI5QzM4LjIwOCA3NC40ODU1IDQwLjQ0MjQgNzcuOTAzMSA0MC40NDI0IDgxLjY3ODlWOTEuMjY2M0M0MC40NDI0IDkyLjM2MiAzOS41NTU1IDkzLjI1IDM4LjQ1OTkgOTMuMjVIMjcuMzc1NkMyMC43MDI0IDkzLjI1IDE0LjcwNTcgODcuODk5MSAxNC41ODkxIDgxLjIyMzNWNTMuODY2M0MxNC41ODkxIDUxLjI0NDYgMTYuMzA0NSA0OC45MzE2IDE4LjgxMzIgNDguMTcwN1oiCiAgICAgICAgZmlsbD0idXJsKCNwYWludDJfbGluZWFyXzM3Ml80MDI1OSkiIC8+CiAgICA8ZGVmcz4KICAgICAgICA8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMzcyXzQwMjU5IiB4MT0iNDkuMzA1NyIgeTE9IjIuMDc5IiB4Mj0iODAuMzYyNyIgeTI9IjkzLjY1OTciCiAgICAgICAgICAgIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KICAgICAgICAgICAgPHN0b3Agc3RvcC1jb2xvcj0iI0Y1RDQ1RSIgLz4KICAgICAgICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkY5NjAwIiAvPgogICAgICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgICAgICAgPGxpbmVhckdyYWRpZW50IGlkPSJwYWludDFfbGluZWFyXzM3Ml80MDI1OSIgeDE9IjQ5LjMwNTciIHkxPSIyLjA3OSIgeDI9IjgwLjM2MjciIHkyPSI5My42NTk3IgogICAgICAgICAgICBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgICAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNGNUQ0NUUiIC8+CiAgICAgICAgICAgIDxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iI0ZGOTYwMCIgLz4KICAgICAgICA8L2xpbmVhckdyYWRpZW50PgogICAgICAgIDxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQyX2xpbmVhcl8zNzJfNDAyNTkiIHgxPSI0OS4zMDU3IiB5MT0iMi4wNzkiIHgyPSI4MC4zNjI3IiB5Mj0iOTMuNjU5NyIKICAgICAgICAgICAgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICAgICAgICA8c3RvcCBzdG9wLWNvbG9yPSIjRjVENDVFIiAvPgogICAgICAgICAgICA8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjk2MDAiIC8+CiAgICAgICAgPC9saW5lYXJHcmFkaWVudD4KICAgIDwvZGVmcz4KPC9zdmc+',
    downloads: {
      chrome: 'https://chrome.google.com/webstore/detail/braavos-wallet/jnlgamecbpmbajjfhmmmlhejkemejdma',
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/braavos-wallet',
      edge: 'https://microsoftedge.microsoft.com/addons/detail/braavos-wallet/hkkpjehhcnhgefhbdcgfkeegglpjchdc',
    },
    website: 'https://braavos.app/',
  },
  {
    id: 'okxwallet',
    name: 'OKX Wallet',
    icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAJDSURBVHgB7Zq9jtpAEMfHlhEgQLiioXEkoAGECwoKxMcTRHmC5E3IoyRPkPAEkI7unJYmTgEFTYwA8a3NTKScLnCHN6c9r1e3P2llWQy7M/s1Gv1twCP0ej37dDq9x+Zut1t3t9vZjDEHIiSRSPg4ZpDL5fxkMvn1cDh8m0wmfugfO53OoFQq/crn8wxfY9EymQyrVCqMfHvScZx1p9ls3pFxXBy/bKlUipGPrVbLuQqAfsCliq3zl0H84zwtjQrOw4Mt1W63P5LvBm2d+Xz+YzqdgkqUy+WgWCy+Mc/nc282m4FqLBYL+3g8fjDxenq72WxANZbLJeA13zDX67UDioL5ybXwafMYu64Ltn3bdDweQ5R97fd7GyhBQMipx4POeEDHIu2LfDdBIGGz+hJ9CQ1ABjoA2egAZPM6AgiCAEQhsi/C4jHyPA/6/f5NG3Ks2+3CYDC4aTccDrn6ojG54MnEvG00GoVmWLIRNZ7wTCwDHYBsdACy0QHIhiuRETxlICWpMMhGZHmqS8qH6JLyGegAZKMDkI0uKf8X4SWlaZo+Pp1bRrwlJU8ZKLIvUjKh0WiQ3sRUbNVq9c5Ebew7KEo2m/1p4jJ4qAmDaqDQBzj5XyiAT4VCQezJigAU+IDU+z8vJFnGWeC+bKQV/5VZ71FV6L7PA3gg3tXrdQ+DgLhC+75Wq3no69P3MC0NFQpx2lL04Ql9gHK1bRDjsSBIvScBnDTk1WrlGIZBorIDEYJj+rhdgnQ67VmWRe0zlplXl81vcyEt0rSoYDUAAAAASUVORK5CYII=',
    downloads: {
      chrome: 'https://chrome.google.com/webstore/detail/mcohilncbfahbmgdjkbpemcciiolgcge',
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/okexwallet',
      edge: 'https://microsoftedge.microsoft.com/addons/detail/%E6%AC%A7%E6%98%93-web3-%E9%92%B1%E5%8C%85/pbpjkcldjiffchgbbndmhojiacbgflha',
      safari: 'https://apps.apple.com/us/app/okx-wallet/id6463797825',
    },
    website: 'https://www.okx.com/',
  },
]
